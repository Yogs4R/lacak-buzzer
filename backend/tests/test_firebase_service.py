import os
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

from firebase_admin import firestore
from services import firebase_service

mock_db = MagicMock()


@pytest.fixture(autouse=True)
def reset_mocks():
    """Mereset semua mock sebelum setiap pengujian untuk mencegah kebocoran antar test."""
    mock_db.reset_mock()
    mock_db.collection.side_effect = None
    mock_db.collection.return_value = MagicMock()
    yield


def test_get_db_offline_mode():
    """get_db harus mengembalikan None jika berkas kredensial tidak ada."""
    with patch("os.path.exists", return_value=False):
        firebase_service._initialized = False
        firebase_service._db = None
        
        db = firebase_service.get_db()
        assert db is None
        assert firebase_service._initialized is True


def test_get_db_success():
    """get_db harus mengembalikan client Firestore jika berkas kredensial ditemukan."""
    with patch("os.path.exists", return_value=True), \
         patch("firebase_admin.initialize_app") as mock_init, \
         patch("firebase_admin.credentials.Certificate") as mock_cert, \
         patch("firebase_admin.firestore.client", return_value=mock_db) as mock_client:
        
        firebase_service._initialized = False
        firebase_service._db = None
        
        db = firebase_service.get_db()
        assert db == mock_db
        assert firebase_service._initialized is True


def test_save_scan_history():
    """save_scan_history harus menyimpan data ke scan_history dengan username_lower dan memperbarui global_stats secara atomik."""
    with patch("services.firebase_service.get_db", return_value=mock_db):
        mock_scan_history_col = MagicMock()
        mock_scan_history_doc = MagicMock()
        mock_scan_history_col.document.return_value = mock_scan_history_doc
        
        mock_metadata_col = MagicMock()
        mock_global_stats_doc = MagicMock()
        mock_metadata_col.document.return_value = mock_global_stats_doc
        
        # Arahkan pemanggilan collection ke mock yang sesuai
        def collection_side_effect(name):
            if name == "scan_history":
                return mock_scan_history_col
            elif name == "metadata":
                return mock_metadata_col
            return MagicMock()
            
        mock_db.collection.side_effect = collection_side_effect
        
        # Mock global_stats document get()
        mock_stats_snapshot = MagicMock()
        mock_stats_snapshot.exists = True
        mock_global_stats_doc.get.return_value = mock_stats_snapshot
        
        report = {"score": 75, "risk_band": "Tinggi"}
        firebase_service.save_scan_history("Target_User", 75, "Tinggi", report)
        
        # Verifikasi penyimpanan dokumen
        mock_scan_history_doc.set.assert_called_once_with({
            "username": "Target_User",
            "username_lower": "target_user",
            "score": 75,
            "risk_label": "Tinggi",
            "full_report": report,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        
        # Verifikasi increment atomik pada global_stats
        mock_global_stats_doc.update.assert_called_once_with({
            "total_scans": firestore.Increment(1),
            "breakdown.Tinggi": firestore.Increment(1)
        })


def test_get_global_stats_exists():
    """get_global_stats harus mengembalikan data dari Firestore jika dokumen ada."""
    with patch("services.firebase_service.get_db", return_value=mock_db):
        mock_metadata_col = MagicMock()
        mock_global_stats_doc = MagicMock()
        mock_metadata_col.document.return_value = mock_global_stats_doc
        mock_db.collection.side_effect = lambda name: mock_metadata_col if name == "metadata" else MagicMock()
        
        mock_stats_snapshot = MagicMock()
        mock_stats_snapshot.exists = True
        mock_stats_snapshot.to_dict.return_value = {
            "total_scans": 15,
            "breakdown": {
                "Rendah": 10,
                "Sedang": 5,
                "Tinggi": 0,
                "Ekstrem": 0
            }
        }
        mock_global_stats_doc.get.return_value = mock_stats_snapshot
        
        stats = firebase_service.get_global_stats()
        assert stats["total_scans"] == 15
        assert stats["breakdown"]["Rendah"] == 10


def test_get_recent_scans():
    """get_recent_scans harus mengambil data terbaru terurut berdasarkan created_at descending."""
    with patch("services.firebase_service.get_db", return_value=mock_db):
        mock_col = MagicMock()
        mock_query_1 = MagicMock()
        mock_query_2 = MagicMock()
        
        mock_db.collection.return_value = mock_col
        mock_col.order_by.return_value = mock_query_1
        mock_query_1.limit.return_value = mock_query_2
        
        doc1 = MagicMock()
        doc1.to_dict.return_value = {
            "username": "user1",
            "score": 45,
            "risk_label": "Sedang",
            "created_at": datetime(2026, 6, 9, 12, 0, 0, tzinfo=timezone.utc)
        }
        mock_query_2.stream.return_value = [doc1]
        
        res = firebase_service.get_recent_scans(5)
        mock_col.order_by.assert_called_once_with("created_at", direction=firestore.Query.DESCENDING)
        mock_query_1.limit.assert_called_once_with(20)
        assert len(res) == 1
        assert res[0]["username"] == "user1"


def test_get_safest_accounts():
    """get_safest_accounts harus mengambil data dengan score ascending."""
    with patch("services.firebase_service.get_db", return_value=mock_db):
        mock_col = MagicMock()
        mock_query_1 = MagicMock()
        mock_query_2 = MagicMock()
        
        mock_db.collection.return_value = mock_col
        mock_col.order_by.return_value = mock_query_1
        mock_query_1.limit.return_value = mock_query_2
        
        doc1 = MagicMock()
        doc1.to_dict.return_value = {
            "username": "safest1",
            "score": 12,
            "risk_label": "Rendah",
            "created_at": None
        }
        mock_query_2.stream.return_value = [doc1]
        
        res = firebase_service.get_safest_accounts(5)
        mock_col.order_by.assert_called_once_with("score", direction=firestore.Query.ASCENDING)
        mock_query_1.limit.assert_called_once_with(20)
        assert len(res) == 1
        assert res[0]["username"] == "safest1"


def test_get_riskiest_accounts():
    """get_riskiest_accounts harus mengambil data dengan score descending."""
    with patch("services.firebase_service.get_db", return_value=mock_db):
        mock_col = MagicMock()
        mock_query_1 = MagicMock()
        mock_query_2 = MagicMock()
        
        mock_db.collection.return_value = mock_col
        mock_col.order_by.return_value = mock_query_1
        mock_query_1.limit.return_value = mock_query_2
        
        doc1 = MagicMock()
        doc1.to_dict.return_value = {
            "username": "risky1",
            "score": 98,
            "risk_label": "Ekstrem",
            "created_at": None
        }
        mock_query_2.stream.return_value = [doc1]
        
        res = firebase_service.get_riskiest_accounts(5)
        mock_col.order_by.assert_called_once_with("score", direction=firestore.Query.DESCENDING)
        mock_query_1.limit.assert_called_once_with(20)
        assert len(res) == 1
        assert res[0]["username"] == "risky1"


def test_get_scan_report():
    """get_scan_report harus mencari report berdasarkan username_lower secara case-insensitive."""
    with patch("services.firebase_service.get_db", return_value=mock_db):
        mock_col = MagicMock()
        mock_query_1 = MagicMock()
        
        mock_db.collection.return_value = mock_col
        mock_col.where.return_value = mock_query_1
        
        doc1 = MagicMock()
        report = {"score": 50, "target": "TestUser"}
        doc1.to_dict.return_value = {
            "username": "TestUser",
            "username_lower": "testuser",
            "full_report": report,
            "created_at": "2026-06-09T00:00:00Z"
        }
        mock_query_1.stream.return_value = [doc1]
        
        res = firebase_service.get_scan_report("tEsTuSeR")
        mock_col.where.assert_called_once_with("username_lower", "==", "testuser")
        assert res == report
