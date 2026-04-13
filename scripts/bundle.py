#!/usr/bin/env python3
"""Bundle YAML question files into a single content.json for the frontend."""
import json
import os
import sys
from datetime import datetime, timezone

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML not installed. Run: pip install pyyaml")
    sys.exit(1)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'content.json')

def bundle():
    subjects = {}
    questions = []

    for subject in sorted(os.listdir(DATA_DIR)):
        subject_path = os.path.join(DATA_DIR, subject)
        if not os.path.isdir(subject_path):
            continue

        topics = []
        for fname in sorted(os.listdir(subject_path)):
            if not fname.endswith('.yaml') and not fname.endswith('.yml'):
                continue

            topic = os.path.splitext(fname)[0]
            filepath = os.path.join(subject_path, fname)

            with open(filepath, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)

            if not isinstance(data, list):
                print(f"  SKIP {filepath} (not a list)")
                continue

            valid = 0
            for q in data:
                if not isinstance(q, dict) or 'id' not in q:
                    continue
                q['source'] = f"{subject}/{topic}"
                questions.append(q)
                valid += 1

            if valid > 0:
                topics.append(topic)
                print(f"  {subject}/{topic}: {valid} questions")

        if topics:
            subjects[subject] = topics

    output = {
        'subjects': subjects,
        'questions': questions,
        'meta': {
            'total_questions': len(questions),
            'generated_at': datetime.now(timezone.utc).isoformat(),
        }
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=None)

    print(f"\nBundled {len(questions)} questions from {len(subjects)} subjects → {OUTPUT}")

if __name__ == '__main__':
    bundle()
