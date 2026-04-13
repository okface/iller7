#!/usr/bin/env python3
"""Validate all YAML question files for schema compliance."""
import os
import sys

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML not installed. Run: pip install pyyaml")
    sys.exit(1)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
REQUIRED_FIELDS = {'id', 'type', 'question', 'options'}
errors = []

def validate():
    seen_ids = set()
    total = 0

    for subject in sorted(os.listdir(DATA_DIR)):
        subject_path = os.path.join(DATA_DIR, subject)
        if not os.path.isdir(subject_path):
            continue

        for fname in sorted(os.listdir(subject_path)):
            if not fname.endswith('.yaml') and not fname.endswith('.yml'):
                continue

            filepath = os.path.join(subject_path, fname)
            with open(filepath, 'r', encoding='utf-8') as f:
                try:
                    data = yaml.safe_load(f)
                except yaml.YAMLError as e:
                    errors.append(f"YAML parse error in {filepath}: {e}")
                    continue

            if not isinstance(data, list):
                continue

            for i, q in enumerate(data):
                if not isinstance(q, dict):
                    errors.append(f"{filepath}[{i}]: not a dict")
                    continue

                total += 1
                qid = q.get('id', f'MISSING-{i}')

                # Check required fields
                missing = REQUIRED_FIELDS - set(q.keys())
                if missing:
                    errors.append(f"{filepath} [{qid}]: missing fields: {missing}")

                # Check duplicate IDs
                if qid in seen_ids:
                    errors.append(f"{filepath} [{qid}]: duplicate ID")
                seen_ids.add(qid)

                # Check options
                opts = q.get('options', [])
                if not isinstance(opts, list) or len(opts) < 2:
                    errors.append(f"{filepath} [{qid}]: needs at least 2 options")
                    continue

                correct_count = sum(1 for o in opts if o.get('correct'))
                if correct_count != 1:
                    errors.append(f"{filepath} [{qid}]: has {correct_count} correct answers (expected 1)")

    if errors:
        print(f"VALIDATION FAILED — {len(errors)} errors in {total} questions:\n")
        for e in errors:
            print(f"  ✗ {e}")
        sys.exit(1)
    else:
        print(f"✓ All {total} questions valid. No errors.")

if __name__ == '__main__':
    validate()
