"""
APIClient — thin wrapper over `requests` for testing the Flask backend directly.
"""

import os
from typing import Any, Dict, Optional, Tuple

import requests


class APIClient:
    ROBOT_LIBRARY_SCOPE = "TEST"

    def __init__(self, base_url: Optional[str] = None, timeout: int = 10):
        self.base_url = (base_url or os.environ.get("API_BASE_URL", "")).rstrip("/")
        if not self.base_url:
            raise ValueError(
            )
        self.timeout = timeout
        self._session = requests.Session()

    def _url(self, path: str) -> str:
        return f"{self.base_url}/{path.lstrip('/')}"

    def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Tuple[int, Any]:
        resp = self._session.get(self._url(path), params=params, timeout=self.timeout)
        return resp.status_code, self._parse(resp)

    def post(self, path: str, json_body: Optional[Dict[str, Any]] = None) -> Tuple[int, Any]:
        resp = self._session.post(self._url(path), json=json_body, timeout=self.timeout)
        return resp.status_code, self._parse(resp)

    @staticmethod
    def _parse(resp: requests.Response) -> Any:
        try:
            return resp.json()
        except ValueError:
            return resp.text