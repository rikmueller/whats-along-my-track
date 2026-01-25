#!/usr/bin/env python3
"""
Simple API test script to verify Flask endpoints work.
Run with: python3 backend/test_api.py
"""

import sys
import json

from app import app, create_job, update_job, get_job


def test_job_registry():
    print("Testing job registry...")
    job_id = create_job("TestProject")
    assert job_id, "Failed to create job"
    print(f"✓ Created job: {job_id}")

    job = get_job(job_id)
    assert job is not None, "Failed to retrieve job"
    assert job['state'] == 'queued', "Job should start in 'queued' state"
    print(f"✓ Job state: {job['state']}")

    update_job(job_id, state='processing', percent=50, message='Testing...')
    job = get_job(job_id)
    assert job['state'] == 'processing', "Job should be 'processing'"
    assert job['percent'] == 50, "Job percent should be 50"
    print(f"✓ Updated job: state={job['state']}, percent={job['percent']}")

    update_job(job_id, state='completed', percent=100, message='Done!')
    job = get_job(job_id)
    assert job['state'] == 'completed', "Job should be 'completed'"
    print("✓ Job completed")
    print("✅ Job registry tests passed!\n")


def test_flask_endpoints():
    print("Testing Flask endpoints...")
    with app.test_client() as client:
        print("  Testing GET /health...")
        response = client.get('/health')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'healthy', "Should be healthy"
        print("  ✓ /health works")

        print("  Testing GET /api/config...")
        response = client.get('/api/config')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'defaults' in data, "Response should have 'defaults'"
        assert 'presets' in data, "Response should have 'presets'"
        print(f"  ✓ /api/config works (found {len(data['presets'])} presets)")

        print("  Testing POST /api/process (missing file)...")
        response = client.post('/api/process', data={})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("  ✓ /api/process validates file upload")

        print("  Testing GET /api/status (nonexistent job)...")
        response = client.get('/api/status/fake-job-id')
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("  ✓ /api/status returns 404 for missing job")

    print("✅ Flask endpoint tests passed!\n")


if __name__ == '__main__':
    print("=" * 50)
    print("AlongGPX API Test Suite")
    print("=" * 50 + "\n")
    try:
        test_job_registry()
        test_flask_endpoints()
        print("=" * 50)
        print("✅ All tests passed!")
        print("=" * 50)
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
