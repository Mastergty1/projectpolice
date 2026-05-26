"use client";

import styles from "./SelfAdd.module.css";

interface Assignment {
  type: string;
  value: string;
  topics: string;
}

interface Props {
  index: number;
  assign: Assignment;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export default function AssignmentItem({ index, assign, onChange, onRemove }: Props) {
  return (
    <div className={styles.AssignmentItem}>
      <div>
        <label className={styles.Label}>ประเภท</label>
        <select
          value={assign.type}
          onChange={(e) => onChange(index, "type", e.target.value)}
          className={styles.Select}
        >
          <option value="user_id">User ID (รหัสผู้ใช้)</option>
          <option value="role_or_name">Role / Name (ชื่อหรือตำแหน่ง)</option>
        </select>
      </div>
      <div>
        <label className={styles.Label}>
          {assign.type === "user_id" ? "ระบุ User ID" : "ระบุชื่อหรือตำแหน่ง"}
        </label>
        <input
          type={assign.type === "user_id" ? "number" : "text"}
          value={assign.value}
          onChange={(e) => onChange(index, "value", e.target.value)}
          required
          className={styles.Input}
        />
      </div>

      <div>
        <label className={styles.Label}>
          งานย่อย (Topics) <span style={{ fontWeight: 'normal', opacity: 0.6 }}>- คั่นด้วย (,)</span>
        </label>
        <input
          type="text"
          value={assign.topics}
          onChange={(e) => onChange(index, "topics", e.target.value)}
          placeholder="งาน 1, งาน 2"
          className={styles.Input}
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className={styles.RemoveButton}
        title="ลบ"
      >
        ✕
      </button>
    </div>
  );
}