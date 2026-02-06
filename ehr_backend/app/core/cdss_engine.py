# The cdss rule engine, this is where the main logic of the cdss is

"""
Reusable CDSS (Clinical Decision Support System) Rule Engine.

This engine is generic and works for ANY component (physical exam, vital signs, ADL, etc.)
and ANY DPIE step (assessment, diagnosis, planning, intervention, evaluation).

Usage:
    from app.core.cdss_engine import CDSSEngine

    engine = CDSSEngine("app/cdss_rules/physical_exam/assessment.yaml")
    alerts = engine.evaluate({"general_appearance": "pale", "skin_condition": "jaundice"})
    # Returns: {"general_appearance_alert": "Pallor can be...", "skin_alert": "Jaundice indicates..."}

    engine = CDSSEngine("app/cdss_rules/physical_exam/diagnosis.yaml")
    alert = engine.evaluate_single("pain")
    # Returns: "Recommend pain assessment (e.g., PQRST, 0-10 scale)."
"""

import os
import yaml
from typing import Dict, Optional


class CDSSEngine:
    """
    A generic, reusable CDSS rule engine that loads rules from a YAML file
    and evaluates inputs against keyword-based rules.
    """

    def __init__(self, rules_yaml_path: str):
        """
        Initialize the engine with a path to a YAML rules file.
        The path is relative to the project root.
        """
        self.rules_yaml_path = rules_yaml_path
        self.rules = self._load_rules()

    def _load_rules(self) -> dict:
        """Load rules from the YAML file."""
        # Resolve path relative to the app directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        full_path = os.path.join(base_dir, self.rules_yaml_path)

        if not os.path.exists(full_path):
            raise FileNotFoundError(f"CDSS rules file not found: {full_path}")

        with open(full_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def evaluate(self, inputs: Dict[str, Optional[str]]) -> Dict[str, str]:
        """
        Evaluate multiple input fields against rules (for assessment step).

        Used when the nurse submits multiple fields at once, e.g.:
        {"general_appearance": "pale", "skin_condition": "jaundice", ...}

        Returns a dict of alert fields, e.g.:
        {"general_appearance_alert": "...", "skin_alert": "No Findings"}

        Each field in the YAML has a list of rules with keywords and alert text.
        If no rule matches, returns "No Findings".
        """
        alerts = {}
        fields_config = self.rules.get("fields", {})

        for field_name, field_rules in fields_config.items():
            input_value = inputs.get(field_name)
            alert_key = field_rules.get("alert_field", f"{field_name}_alert")
            alert_text = self._match_rules(input_value, field_rules.get("rules", []))
            alerts[alert_key] = alert_text

        return alerts

    def evaluate_single(self, input_text: Optional[str]) -> str:
        """
        Evaluate a single text input against rules (for DPIE steps).

        Used for diagnosis, planning, intervention, evaluation where
        the nurse types free text and we match keywords.

        Returns the combined alert text, or empty string if no match.
        """
        if not input_text:
            return ""

        rules_list = self.rules.get("rules", [])
        matched_alerts = []

        for rule in rules_list:
            keywords = rule.get("keywords", [])
            if self._text_matches_keywords(input_text, keywords):
                alert = rule.get("alert", "")
                severity = rule.get("severity", "info")
                prefix = self._severity_prefix(severity)
                matched_alerts.append(f"{prefix}{alert}")

        return "\n".join(matched_alerts)

    def _match_rules(self, input_value: Optional[str], rules: list) -> str:
        """Match a single input value against a list of rules for that field."""
        if not input_value or not input_value.strip():
            return "No Findings"

        matched_alerts = []
        input_lower = input_value.lower().strip()

        for rule in rules:
            keywords = rule.get("keywords", [])
            if self._text_matches_keywords(input_lower, keywords):
                alert = rule.get("alert", "")
                severity = rule.get("severity", "info")
                prefix = self._severity_prefix(severity)
                matched_alerts.append(f"{prefix}{alert}")

        return "\n".join(matched_alerts) if matched_alerts else "No Findings"

    def _text_matches_keywords(self, text: str, keywords: list) -> bool:
        """Check if any keyword is found in the input text (case-insensitive)."""
        if not text or not keywords:
            return False
        text_lower = text.lower()
        return any(kw.lower() in text_lower for kw in keywords)

    @staticmethod
    def _severity_prefix(severity: str) -> str:
        """Return a prefix string based on severity level."""
        prefixes = {
            "critical": "— CRITICAL: ",
            "warning": "— WARNING: ",
            "info": "— ",
        }
        return prefixes.get(severity.lower(), "— ")
