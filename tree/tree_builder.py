import sqlite3
import json

DB_PATH = "people.db"
OUTPUT_FILE = "tree.json"


def get_person(cursor, person_id):
    cursor.execute("""
        SELECT id, first_name, last_name, patronymic
        FROM people
        WHERE id = ?
    """, (person_id,))
    row = cursor.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "firstName": row[1],
        "lastName": row[2],
        "patronymic": row[3]
    }


def get_relationship(cursor, member_id):
    cursor.execute("""
        SELECT parent_id, spouse_id
        FROM relationships
        WHERE member_id = ?
    """, (member_id,))
    return cursor.fetchone()


def get_children(cursor, parent_id):
    cursor.execute("""
        SELECT member_id
        FROM relationships
        WHERE parent_id = ?
    """, (parent_id,))
    return [row[0] for row in cursor.fetchall()]


def build_person_tree(cursor, person_id):
    person = get_person(cursor, person_id)
    if not person:
        return None

    relation = get_relationship(cursor, person_id)

    # --- супруг ---
    spouse_data = None

    if relation and relation[1]:  # spouse_id
        spouse = get_person(cursor, relation[1])
        if spouse:
            spouse_data = {
                "firstName": spouse["firstName"],
                "lastName": spouse["lastName"],
                "patronymic": spouse["patronymic"]
            }

    # --- дети ---
    children_ids = get_children(cursor, person_id)
    children = []

    for child_id in children_ids:
        child_tree = build_person_tree(cursor, child_id)
        if child_tree:
            children.append(child_tree)

    return {
        "firstName": person["firstName"],
        "lastName": person["lastName"],
        "patronymic": person["patronymic"],
        "spouse": spouse_data,
        "children": children
    }


def calculate_depth(node):
    if not node or not node["children"]:
        return 1
    return 1 + max(calculate_depth(child) for child in node["children"])


def get_root(cursor):
    cursor.execute("""
        SELECT id
        FROM people
        WHERE is_root = 1
        LIMIT 1
    """)
    row = cursor.fetchone()
    return row[0] if row else None


def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    root_id = get_root(cursor)

    if not root_id:
        print("❌ Root person not found (is_root = 1)")
        return

    # --- строим дерево ---
    tree = build_person_tree(cursor, root_id)

    # --- считаем глубину ---
    depth = calculate_depth(tree)

    result = {
        "max_generations": depth,
        "root": tree
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)

    print(f"✅ Tree saved to {OUTPUT_FILE}")
    print(f"📊 Max generations: {depth}")

    conn.close()


if __name__ == "__main__":
    main()