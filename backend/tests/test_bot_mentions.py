"""
Unit test untuk parsing mention bot dan normalisasi target.
"""
from api.analyze import normalize_username


def test_username_normalization():
    test_cases = {
        "detikcom": "detikcom",
        "  detikcom  ": "detikcom",
        "@detikcom": "detikcom",
        " @detikcom ": "detikcom",
        "https://x.com/detikcom": "detikcom",
        "http://twitter.com/detikcom": "detikcom",
        "https://twitter.com/detikcom?s=20&t=abc": "detikcom",
        "x.com/detikcom": "detikcom",
        "twitter.com/detikcom": "detikcom",
        "https://x.com/@detikcom": "detikcom",
    }

    for input_target, expected_username in test_cases.items():
        assert normalize_username(input_target) == expected_username
