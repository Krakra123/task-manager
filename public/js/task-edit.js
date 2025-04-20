document.addEventListener("DOMContentLoaded", () => {
    const tasks = document.querySelectorAll(".task");
  
    tasks.forEach(task => {
      const saveBtn = task.querySelector(".save-btn");
  
      // Create Cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.classList.add("cancel-btn");
      cancelBtn.textContent = "Cancel";
      saveBtn.insertAdjacentElement("afterend", cancelBtn);
  
      // Create Edit button
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.textContent = "Edit";
      editBtn.style.display = "none";
      cancelBtn.insertAdjacentElement("afterend", editBtn);
  
      const nameBox = task.querySelector(".task-name");
      const descBox = task.querySelector(".task-desc");
      let originalName = nameBox.value;
      let originalDesc = descBox.value;
  
      const saveHandler = () => {
        originalName = nameBox.value;
        originalDesc = descBox.value;
        nameBox.setAttribute("readonly", true);
        descBox.setAttribute("readonly", true);
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editBtn.style.display = "inline-block";
      };
  
      const cancelHandler = () => {
        nameBox.value = originalName;
        descBox.value = originalDesc;
        nameBox.setAttribute("readonly", true);
        descBox.setAttribute("readonly", true);
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editBtn.style.display = "inline-block";
      };
  
      const editHandler = () => {
        nameBox.removeAttribute("readonly");
        descBox.removeAttribute("readonly");
        saveBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";
        editBtn.style.display = "none";
        nameBox.focus();
      };
  
      saveBtn.addEventListener("click", saveHandler);
      cancelBtn.addEventListener("click", cancelHandler);
      editBtn.addEventListener("click", editHandler);
  
      // Enter to Save
      nameBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveHandler();
        }
      });
  
      descBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); // avoid newline
          saveHandler();
        }
      });
  
      // Initial state: disable editing
      nameBox.setAttribute("readonly", true);
      descBox.setAttribute("readonly", true);
    });
  });