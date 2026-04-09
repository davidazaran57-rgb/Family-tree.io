import sqlite3

DB_NAME = 'people.db'
FILE_NAME = 'people.txt'


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            patronymic TEXT,
            is_root INTEGER DEFAULT 0
        )
    ''')

    # 🔥 если таблица уже была без is_root — добавим колонку
    cursor.execute("PRAGMA table_info(people)")
    columns = [col[1] for col in cursor.fetchall()]

    if "is_root" not in columns:
        cursor.execute("ALTER TABLE people ADD COLUMN is_root INTEGER DEFAULT 0")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER UNIQUE,
            parent_id INTEGER,
            spouse_id INTEGER
        )
    """)

    conn.commit()
    conn.close()


def clear_table():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM people")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='people'")

    conn.commit()
    conn.close()

    print("Таблица очищена и счетчик сброшен")


def load_from_file():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    try:
        with open(FILE_NAME, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        added = 0

        for line in lines:
            parts = line.strip().split()

            if len(parts) != 3:
                print(f"Пропущена строка: {line.strip()}")
                continue

            first_name, last_name, patronymic = parts

            cursor.execute('''
                INSERT INTO people (last_name, first_name, patronymic, is_root)
                VALUES (?, ?, ?, 0)
            ''', (last_name, first_name, patronymic))

            added += 1

        conn.commit()
        print(f"Добавлено записей: {added}")

    except FileNotFoundError:
        print(f"Файл {FILE_NAME} не найден")

    finally:
        conn.close()

def drop():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        DROP TABLE people ''')
    cursor.execute('''
        DROP TABLE relationships ''')
    conn.commit()
    conn.close()

def show():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        select * from relationships ''')
    result=cursor.fetchall()
    for row in result:
        print(row)

    print('\n')
    cursor.execute('''
        select * from people ''')
    result=cursor.fetchall()
    for row in result:
        print(row) 
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    clear_table()
    load_from_file()
