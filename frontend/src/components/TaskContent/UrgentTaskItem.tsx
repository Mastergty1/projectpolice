import styles from "./TaskItem.module.css"

type TaskItemProps = {
  date: string;
  name: string;
  personInCharge: string;
  status: string;
  id: string;
};

export default function UrgentTaskItem({date,name,personInCharge,status,id}:TaskItemProps){
    return(
        <div className={styles.TaskWrapper}>
         ttt

        </div>
    );
}