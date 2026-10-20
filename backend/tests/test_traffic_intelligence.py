"""
Tests for Traffic Intelligence engine
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from traffic_intelligence import TrafficIntelligence


class TestTrafficIntelligence(unittest.TestCase):
    def setUp(self):
        self.engine = TrafficIntelligence()

    def test_congestion_index_free_flow(self):
        idx = self.engine.calculate_congestion_index(60.0, 60.0, incidents=0)
        self.assertEqual(idx, 0)

    def test_congestion_index_gridlock(self):
        idx = self.engine.calculate_congestion_index(0.0, 60.0, incidents=4)
        self.assertEqual(idx, 100)

    def test_congestion_index_partial(self):
        idx = self.engine.calculate_congestion_index(30.0, 60.0, incidents=0)
        self.assertEqual(idx, 40)

    def test_fallback_flow_segment(self):
        segment = self.engine.get_flow_segment(37.7749, -122.4194)
        self.assertIn("congestion_index", segment)
        self.assertIn("provider", segment)
        self.assertGreaterEqual(segment["current_speed_kmh"], 0)
        self.assertGreater(segment["free_flow_speed_kmh"], 0)

    def test_get_incidents(self):
        incidents = self.engine.get_incidents(37.0, -123.0, 38.0, -122.0)
        self.assertIsInstance(incidents, list)
        self.assertGreater(len(incidents), 0)
        self.assertIn("severity", incidents[0])


if __name__ == "__main__":
    unittest.main()
