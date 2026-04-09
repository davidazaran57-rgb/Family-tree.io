import sqlite3
import tkinter as tk
from tkinter import ttk
import subprocess
import sys

# ================= БАЗА =================
def load_data():
    conn = sqlite3.connect("people.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, first_name, last_name, patronymic, is_root FROM people")
    rows = cursor.fetchall()
    conn.close()
    return rows


all_rows = load_data()

def build_people_choices(rows):
    return [(row[0], f"{row[1]} {row[2]} {row[3]}") for row in rows]

people_choices = build_people_choices(all_rows)

# ================= UI =================
root = tk.Tk()
root.title("People Table")
root.geometry("700x550")

# === Верхняя панель ===
top_frame = tk.Frame(root)
top_frame.pack(fill="x", padx=5, pady=5)

# Кнопка обновления
def refresh_data():
    global all_rows, people_choices

    # запускаем внешний скрипт
    subprocess.run([sys.executable, "data_input.py"])

    # перечитываем базу
    all_rows = load_data()
    people_choices = build_people_choices(all_rows)

    update_table(all_rows)

refresh_button = tk.Button(top_frame, text="Обновить", command=refresh_data)
refresh_button.pack(side="left", padx=5)

# Поиск
search_var = tk.StringVar()
tk.Label(top_frame, text="Поиск:").pack(side="left")
search_entry = tk.Entry(top_frame, textvariable=search_var)
search_entry.pack(side="left", fill="x", expand=True, padx=5)

# === Таблица ===
columns = ("id", "first_name", "last_name", "patronymic", "is_root")
tree = ttk.Treeview(root, columns=columns, show="headings")

sort_state = {col: False for col in columns}

def sort_column(col):
    reverse = sort_state[col]
    sort_state[col] = not reverse

    data = [(tree.set(child, col), child) for child in tree.get_children("")]

    if col == "id":
        data.sort(key=lambda x: int(x[0]), reverse=reverse)
    else:
        data.sort(key=lambda x: x[0].lower(), reverse=reverse)

    for index, (_, item) in enumerate(data):
        tree.move(item, "", index)

for col in columns:
    tree.heading(col, text=col.capitalize(),
                 command=lambda c=col: sort_column(c))
    tree.column(col, width=150)

tree.pack(expand=True, fill="both")

# === Нижняя панель ===
button_frame = tk.Frame(root)
button_frame.pack(fill="x", pady=5)

save_button = tk.Button(button_frame, text="Сохранить")
save_button.pack(side="left", padx=5)

export_button = tk.Button(button_frame, text="Экспортировать")
export_button.pack(side="left", padx=5)

root_var = tk.IntVar()

root_checkbox = tk.Checkbutton(
    button_frame,
    text="Is Root",
    variable=root_var
)
root_checkbox.pack(anchor="w", padx=10)

# === Dropdown с поиском ===
class SearchableDropdown:
    def __init__(self, parent, label_text, options):
        self.selected_id = None
        self.frame = tk.Frame(parent)
        self.frame.pack(side="left", expand=True, fill="both", padx=10)

        tk.Label(self.frame, text=label_text).pack(anchor="w")

        self.var = tk.StringVar()
        self.entry = tk.Entry(self.frame, textvariable=self.var)
        self.entry.pack(fill="x")

        self.listbox = tk.Listbox(self.frame, height=5)
        self.listbox.pack(fill="both", expand=True)

        self.options = options
        self.filtered = options.copy()

        self.update_list()

        self.var.trace_add("write", self.filter)
        self.listbox.bind("<<ListboxSelect>>", self.on_select)

    def get_selected_id(self):
        text = self.var.get().strip().lower()

        for _id, name in self.options:
            if name.lower() == text:
                return _id

        return None

    def get_selected_id(self):
        text = self.var.get().strip().lower()

        for _id, name in self.options:
            if name.lower() == text:
                return _id

        return None
    def update_list(self):
        self.listbox.delete(0, tk.END)
        for _, text in self.filtered:
            self.listbox.insert(tk.END, text)

    def filter(self, *args):
        query = self.var.get().lower()
        self.filtered = [
            opt for opt in self.options
            if query in opt[1].lower()
        ]
        self.update_list()

    def on_select(self, event):
        selection = self.listbox.curselection()
        if selection:
            index = selection[0]
            value = self.filtered[index][1]
            self.var.set(value)

    def update_options(self, new_options):
        self.options = new_options
        self.filtered = new_options.copy()
        self.update_list()

parent_dropdown = SearchableDropdown(button_frame, "Parent", people_choices)
spouse_dropdown = SearchableDropdown(button_frame, "Spouse", people_choices)

button_frame.pack_forget()

# === Выбор строки ===
def on_row_select(event):
    selected = tree.selection()
    if selected:
        item = selected[0]
        values = tree.item(item, "values")

        is_root = values[4]
        root_var.set(is_root)

        button_frame.pack(fill="x", padx=5, pady=10)
    else:
        button_frame.pack_forget()
tree.bind("<<TreeviewSelect>>", on_row_select)

# === Обновление таблицы ===
def update_table(rows):
    tree.delete(*tree.get_children())
    for row in rows:
        tree.insert("", tk.END, values=row)

    # обновляем dropdown'ы
    parent_dropdown.update_options(people_choices)
    spouse_dropdown.update_options(people_choices)

def save_is_root():
    selected = tree.selection()
    if not selected:
        return

    item = selected[0]
    values = tree.item(item, "values")

    member_id = int(values[0])
    is_root = root_var.get()

    conn = sqlite3.connect("people.db")
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE people
        SET is_root = ?
        WHERE id = ?
    """, (is_root, member_id))

    conn.commit()
    conn.close()

# === Поиск ===
def on_search(*args):
    query = search_var.get().lower()
    filtered = [
        row for row in all_rows
        if query in str(row[1]).lower()
        or query in str(row[2]).lower()
        or query in str(row[3]).lower()
    ]
    update_table(filtered)

search_var.trace_add("write", on_search)

def reset_selection():
    tree.selection_remove(tree.selection())

    parent_dropdown.var.set("")
    spouse_dropdown.var.set("")

    parent_dropdown.selected_id = None
    spouse_dropdown.selected_id = None

    button_frame.pack_forget()
    root_var.set(0)

def save_relationship():
    parent_id = parent_dropdown.get_selected_id()
    spouse_id = spouse_dropdown.get_selected_id()
    selected = tree.selection()
    if not selected:
        return

    item = selected[0]
    values = tree.item(item, "values")

    member_id = int(values[0])
    parent_id = parent_dropdown.get_selected_id()
    spouse_id = spouse_dropdown.get_selected_id()
    is_root = root_var.get()

    conn = sqlite3.connect("people.db")
    cursor = conn.cursor()

    # relationships
    cursor.execute("""
        INSERT INTO relationships (member_id, parent_id, spouse_id)
        VALUES (?, ?, ?)
        ON CONFLICT(member_id) DO UPDATE SET
            parent_id=excluded.parent_id,
            spouse_id=excluded.spouse_id
    """, (member_id, parent_id, spouse_id))
    print(f'{member_id}, \n {parent_id},\n {spouse_id}')
    # is_root
    cursor.execute("""
        UPDATE people
        SET is_root = ?
        WHERE id = ?
    """, (is_root, member_id))

    conn.commit()
    conn.close()
    
    reset_selection()

def export_data():
    subprocess.run([sys.executable, "tree_builder.py"])
    reset_selection()

save_button.config(command=save_relationship)
export_button.config(command=export_data)

# Старт
update_table(all_rows)

root.mainloop()