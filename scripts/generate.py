#!/usr/bin/env python3
"""Generate quiz questions using OpenAI structured outputs.

Usage:
  python scripts/generate.py --subject medical_exam --topic kardiologi --count 10
  python scripts/generate.py                    # Interactive mode
  python scripts/generate.py --dry-run ...      # Preview without saving
"""
import argparse
import json
import os
import sys
import uuid

try:
    import yaml
except ImportError:
    print("pip install pyyaml"); sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("pip install openai"); sys.exit(1)

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPTS_DIR, '..', 'data')
SUBJECTS_FILE = os.path.join(SCRIPTS_DIR, 'subjects.yaml')


def load_subjects():
    with open(SUBJECTS_FILE, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def load_existing(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    return data if isinstance(data, list) else []


def get_tag_context(subject_dir):
    """Analyze existing tags across subject for diversity guidance."""
    tags = {}
    if not os.path.isdir(subject_dir):
        return tags
    for fname in os.listdir(subject_dir):
        if not fname.endswith('.yaml'):
            continue
        filepath = os.path.join(subject_dir, fname)
        questions = load_existing(filepath)
        for q in questions:
            for tag in q.get('tags', []):
                tags[tag] = tags.get(tag, 0) + 1
    return tags


def build_schema():
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "question_batch",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "questions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "tags": {"type": "array", "items": {"type": "string"}},
                                "question": {"type": "string"},
                                "options": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "text": {"type": "string"},
                                            "correct": {"type": "boolean"},
                                            "feedback": {"type": "string"}
                                        },
                                        "required": ["text", "correct", "feedback"],
                                        "additionalProperties": False
                                    }
                                },
                                "explanation": {"type": "string"}
                            },
                            "required": ["tags", "question", "options", "explanation"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["questions"],
                "additionalProperties": False
            }
        }
    }


def generate(subject_key, topic, count, dry_run=False):
    subjects = load_subjects()
    if subject_key not in subjects:
        print(f"Unknown subject: {subject_key}")
        print(f"Available: {', '.join(subjects.keys())}")
        sys.exit(1)

    cfg = subjects[subject_key]
    subject_dir = os.path.join(DATA_DIR, subject_key)
    os.makedirs(subject_dir, exist_ok=True)

    filepath = os.path.join(subject_dir, f"{topic}.yaml")
    existing = load_existing(filepath)
    tag_context = get_tag_context(subject_dir)

    print(f"Subject: {cfg['display_name']}")
    print(f"Topic: {topic}")
    print(f"Existing questions in file: {len(existing)}")
    print(f"Generating {count} new questions...")

    # Build user prompt
    tag_summary = ", ".join(f"{k} ({v})" for k, v in sorted(tag_context.items(), key=lambda x: -x[1])[:20])
    user_prompt = f"""Generera {count} nya frågor för ämnet "{topic}".

Befintliga taggar i hela ämnet (för variation): {tag_summary or 'Inga ännu'}
Befintliga frågor i denna fil: {len(existing)}

Undvik att duplicera befintliga frågor. Var kreativ och variera svårighetsgrad."""

    client = OpenAI()
    response = client.chat.completions.create(
        model=cfg['model'],
        messages=[
            {"role": "system", "content": cfg['system_prompt']},
            {"role": "user", "content": user_prompt},
        ],
        response_format=build_schema(),
    )

    result = json.loads(response.choices[0].message.content)
    new_questions = []

    prefix = cfg['id_prefix']
    for q in result['questions']:
        uid = uuid.uuid4().hex[:6]
        question = {
            'id': f"{prefix}-gen-{uid}",
            'type': 'multiple_choice',
            'tags': q['tags'],
            'question': q['question'],
            'image': None,
            'options': q['options'],
            'explanation': q['explanation'],
        }
        new_questions.append(question)

    print(f"\nGenerated {len(new_questions)} questions:")
    for q in new_questions:
        print(f"  - [{', '.join(q['tags'])}] {q['question'][:80]}...")

    if dry_run:
        print("\n[DRY RUN] Not saving.")
        return

    all_questions = existing + new_questions
    with open(filepath, 'w', encoding='utf-8') as f:
        yaml.dump(all_questions, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"\nSaved {len(all_questions)} questions to {filepath}")


def interactive():
    subjects = load_subjects()
    print("Välj ämne:")
    keys = list(subjects.keys())
    for i, k in enumerate(keys):
        print(f"  {i+1}. {subjects[k]['display_name']} ({k})")

    choice = int(input("\n> ")) - 1
    subject_key = keys[choice]

    subject_dir = os.path.join(DATA_DIR, subject_key)
    os.makedirs(subject_dir, exist_ok=True)

    print("\nBefintliga ämnesfiler:")
    existing_files = [f[:-5] for f in os.listdir(subject_dir) if f.endswith('.yaml')]
    for f in existing_files:
        print(f"  - {f}")

    topic = input("\nÄmne (filnamn utan .yaml): ").strip()
    count = int(input("Antal frågor (standard 5): ").strip() or "5")

    generate(subject_key, topic, count)


def main():
    parser = argparse.ArgumentParser(description='Generate quiz questions')
    parser.add_argument('--subject', help='Subject key (e.g., medical_exam)')
    parser.add_argument('--topic', help='Topic name (e.g., kardiologi)')
    parser.add_argument('--count', type=int, default=5, help='Number of questions')
    parser.add_argument('--dry-run', action='store_true', help='Preview without saving')

    args = parser.parse_args()

    if args.subject and args.topic:
        generate(args.subject, args.topic, args.count, args.dry_run)
    else:
        interactive()


if __name__ == '__main__':
    main()
