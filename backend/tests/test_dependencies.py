"""
Test suite for Backend Dependencies
"""
import pytest
import sys

def test_fastapi_installed():
    """Verify FastAPI is installed"""
    import fastapi
    assert fastapi.__version__
    print(f"✓ FastAPI {fastapi.__version__}")

def test_sqlalchemy_installed():
    """Verify SQLAlchemy is installed"""
    import sqlalchemy
    assert sqlalchemy.__version__
    print(f"✓ SQLAlchemy {sqlalchemy.__version__}")

def test_pydantic_installed():
    """Verify Pydantic is installed"""
    import pydantic
    assert pydantic.__version__
    print(f"✓ Pydantic {pydantic.__version__}")

def test_psycopg2_installed():
    """Verify psycopg2 is installed"""
    import psycopg2
    print("✓ psycopg2 installed")

def test_aiohttp_installed():
    """Verify aiohttp is installed"""
    import aiohttp
    assert aiohttp.__version__
    print(f"✓ aiohttp {aiohttp.__version__}")

def test_pandas_installed():
    """Verify pandas is installed"""
    import pandas
    assert pandas.__version__
    print(f"✓ pandas {pandas.__version__}")

def test_numpy_installed():
    """Verify numpy is installed"""
    import numpy
    assert numpy.__version__
    print(f"✓ numpy {numpy.__version__}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
