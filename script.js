document.addEventListener('DOMContentLoaded', function () {
    let selectedTask;
    let tasks;

    const searchBox = document.getElementById('searchBox');
    const showCompleted = document.getElementById('showCompleted');
    const showOngoing = document.getElementById('showOngoing');
    const showCanceled = document.getElementById('showCanceled');
    const showAll = document.getElementById('showAll');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const sumRegisterSpan = document.getElementById('sumRegisterSpan');
    const btnTaskAdd = document.getElementById('btnTaskAdd');
    const btnSetTaskCompleted = document.getElementById("completedTaskButton");
    const btnSetTaskKeepGoing = document.getElementById("keepTaskButton");
    const btnSetTaskCancel = document.getElementById("cancelTaskButton");
    const chooseFilterSpanInfo = document.getElementById("chooseFilterLabelSpan");
    const copyClipBoardButton = document.getElementById("copy-button");

    searchBox.addEventListener('input', filterTasks);
    showCompleted.addEventListener('click', () => filterTasksByStatus(STATUS.COMPLETE));
    showOngoing.addEventListener('click', () => filterTasksByStatus(STATUS.CONTINUING));
    showCanceled.addEventListener('click', () => filterTasksByStatus(STATUS.CANCEL));
    showAll.addEventListener('click', () => showAllTasks());
    addTaskButton.addEventListener('click', () => $('#taskAddModal').modal('show'));
    document.querySelector('.search-icon').addEventListener('click', () => filterTasks());
    btnTaskAdd.addEventListener('click', () => saveTask());
    btnSetTaskCompleted.addEventListener('click', () => setTaskCompleted());
    btnSetTaskKeepGoing.addEventListener('click', () => setTaskKeepGoing());
    btnSetTaskCancel.addEventListener('click',() => setTaskCancel());
    copyClipBoardButton.addEventListener('click',() => copyToClipboard());


    function renderTasks(filteredTasks) {
        filteredTasks.sort((a, b) => convertDate(b.lastUpdated).getTime() - convertDate(a.lastUpdated).getTime());
        taskList.innerHTML = '';
        sumRegisterSpan.innerText = "Toplam Kayıt Sayısı: " + filteredTasks.length;
        filteredTasks.forEach(task => {
            let taskCompany = task.code.slice(0, 2);
            let company;
            if (taskCompany == "QF") {
                company = "https://www.sigortadunyasi.com.tr/wp-content/uploads/2018/02/quick-logo.jpg";
            } else company = "https://northerntelecom.co.uk/media/catalog/product/cache/9865e7c78010b30dbab4bfc2196f1976/v/o/vodaphone_3.jpg"
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';


            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt'; // Font Awesome silme ikonu
            deleteIcon.id = task.id;
            deleteIcon.style.position = 'absolute'; // Üst sağ köşeye yerleştirmek için mutlak konumlandırma
            deleteIcon.style.top = '7px'; // Üstten boşluk
            deleteIcon.style.right = '7px'; // Sağdan boşluk
            deleteIcon.style.cursor = 'pointer'; // Fare imlecini el simgesi yapmak için
            deleteIcon.addEventListener('click', function (e) {
                e.stopPropagation(); // Ana öğe üzerindeki tıklama olayını engellemek için
                if (confirm("[ " + task.code + " ]" + " kodlu taskı silmek istediğinize emin misiniz?")) {
                    let path = DB.TASK + this.id;
                    firebase.database().ref(path).remove()
                        .then(function () {
                            console.log("Görev silindi!"); // Konsola bir mesaj yazdır (isteğe bağlı)
                        })
                        .catch(function (error) {
                            throw new Error("delete comment error", error).stack;
                        });
                }
            });
            //taskItem.appendChild(deleteIcon);

            // taskImage ve taskType'ı içeren konteyner
            const taskInfoContainer = document.createElement('div');
            taskInfoContainer.style.display = 'flex';
            taskInfoContainer.style.alignItems = 'center'; // İçeriklerin dikey eksende merkezlenmesi için

            taskInfoContainer.appendChild(deleteIcon);

            // Resmi oluşturma
            const taskImage = document.createElement('img');
            taskImage.src = company;  // Resminizin URL'sini buraya ekleyin
            taskImage.alt = "Resmin açıklaması"; // Resmin açıklamasını buraya ekleyin (isteğe bağlı)
            taskImage.style.marginRight = '10px'; // Resim ile metin arasında biraz boşluk bırakmak için
            taskImage.width = taskCompany == "QF" ? "125" : "80";
            taskImage.height = "80";
            taskInfoContainer.appendChild(taskImage); // Resmi konteynera ekleyin

            const taskType = document.createElement('span');
            taskType.className = `task-type ${task.type.toLowerCase()}`;
            taskType.innerText = task.type;
            taskInfoContainer.appendChild(taskType); // Metni konteynera ekleyin

            taskItem.appendChild(taskInfoContainer); // Konteyneri taskItem'a ekleyin

            const taskCode = document.createElement('span');
            taskCode.className = 'task-code';
            taskCode.innerText = `${task.code} - ${task.header}`;
            taskItem.appendChild(taskCode);

            const dateContainer = document.createElement('div');
            dateContainer.className = 'date-container';

            // Oluşturulma Tarihi için Konteyner
            const createDateContainer = document.createElement('div');
            createDateContainer.className = 'date-info-container';

            const taskDateLabel = document.createElement('span');
            taskDateLabel.className = 'task-date-label';
            taskDateLabel.innerText = 'Oluşturulma Tarihi:';
            createDateContainer.appendChild(taskDateLabel);

            const taskDate = document.createElement('span');
            taskDate.className = 'task-date';
            taskDate.innerText = task.createdAt;
            createDateContainer.appendChild(taskDate);

            dateContainer.appendChild(createDateContainer);

            // Son Güncelleme Tarihi için Konteyner
            const updateDateContainer = document.createElement('div');
            updateDateContainer.className = 'date-info-container';

            const taskLastUpdateDateLabel = document.createElement('span');
            taskLastUpdateDateLabel.className = 'task-date-label';
            taskLastUpdateDateLabel.innerText = 'Son Güncelleme Tarihi:';
            updateDateContainer.appendChild(taskLastUpdateDateLabel);

            const taskUpdatedDate = document.createElement('span');
            taskUpdatedDate.className = 'task-date';
            taskUpdatedDate.innerText = task.lastUpdated;
            updateDateContainer.appendChild(taskUpdatedDate);

            dateContainer.appendChild(updateDateContainer);

            // Tamamlanma Tarihi için Konteyner
            if (task.completionDate != "null") {
                const completionDateContainer = document.createElement('div');
                completionDateContainer.className = 'date-info-container';

                // Yeni eklenen tik ikonu
                const checkmarkIcon = document.createElement('span');
                checkmarkIcon.innerText = '✔';
                checkmarkIcon.style.color = 'green'; // Yeşil renkli
                checkmarkIcon.style.marginRight = '5px'; // Sağa biraz boşluk ekleyin
                checkmarkIcon.style.padding = "1px 6px";
                checkmarkIcon.style.fontSize = "20px";
                completionDateContainer.appendChild(checkmarkIcon);

                const taskCompletionDateLabel = document.createElement('span');
                taskCompletionDateLabel.className = 'task-date-label';
                taskCompletionDateLabel.style.color = "#8840b6";
                taskCompletionDateLabel.innerText = 'Tamamlanma Tarihi:';
                completionDateContainer.appendChild(taskCompletionDateLabel);

                const taskCompletionDate = document.createElement('span');
                taskCompletionDate.className = 'task-date';
                taskCompletionDate.style.color = "#8840b6";
                taskCompletionDate.style.fontWeight = "bolder";
                taskCompletionDate.innerText = task.completionDate;
                completionDateContainer.appendChild(taskCompletionDate);

                dateContainer.appendChild(completionDateContainer);

            }
            if (task.cancelDate != "null") {
                const completionDateContainer = document.createElement('div');
                completionDateContainer.className = 'date-info-container';

                // Yeni eklenen tik ikonu
                const checkmarkIcon = document.createElement('span');
                checkmarkIcon.innerText = 'X';
                checkmarkIcon.style.color = 'red'; // Yeşil renkli
                checkmarkIcon.style.marginRight = '5px'; // Sağa biraz boşluk ekleyin
                checkmarkIcon.style.padding = "1px 6px";
                checkmarkIcon.style.fontSize = "20px";
                completionDateContainer.appendChild(checkmarkIcon);

                const taskCompletionDateLabel = document.createElement('span');
                taskCompletionDateLabel.className = 'task-date-label';
                taskCompletionDateLabel.style.color = "rgb(255 0 0)";
                taskCompletionDateLabel.innerText = 'İptal Edilme Tarihi:';
                completionDateContainer.appendChild(taskCompletionDateLabel);

                const taskCompletionDate = document.createElement('span');
                taskCompletionDate.className = 'task-date';
                taskCompletionDate.style.color = "rgb(255 0 0)";
                taskCompletionDate.style.fontWeight = "bolder";
                taskCompletionDate.innerText = task.cancelDate;
                completionDateContainer.appendChild(taskCompletionDate);

                dateContainer.appendChild(completionDateContainer);

            }

            // Toplam Yorum Sayısı için Konteyner
            const commentVountContainer = document.createElement('div');
            commentVountContainer.className = 'date-info-container';

            const taskCommentCount = document.createElement('span');
            taskCommentCount.className = 'task-date-label';
            taskCommentCount.innerText = 'Yorum Sayısı: ';
            commentVountContainer.appendChild(taskCommentCount);

            const taskCommentCountNumber = document.createElement('span');
            taskCommentCountNumber.className = 'task-date';
            taskCommentCountNumber.innerText = task.comments ? Object.keys(task.comments).length : 0;
            commentVountContainer.appendChild(taskCommentCountNumber);

            dateContainer.appendChild(commentVountContainer);

            taskItem.appendChild(dateContainer);

            const taskStatus = document.createElement('span');
            let className = `task-status `;
            let innerText = "";
            switch (task.status) {
                case STATUS.CONTINUING:
                    className += 'ongoing';
                    innerText = "Devam Ediyor";
                    break;
                case STATUS.COMPLETE:
                    className += 'completed';
                    innerText = "Tamamlandı";
                    break;
                case STATUS.CANCEL:
                    className += 'canceled';
                    innerText = "İptal Edildi";
                    break;
                default:
                    break;
            }
            taskStatus.className = className;
            taskStatus.innerText = innerText;

            taskItem.appendChild(taskStatus);

            taskItem.addEventListener('click', function () {
                $('#taskDetailsModal').modal('show');
                displayTaskDetails(task);

            });

            taskList.appendChild(taskItem);
        });
    }

    function displayTaskDetails(task) {
        selectedTask = task;
        switch (task.status) {
            case STATUS.CONTINUING: // 0
                //task devam ediyor ise tamamlandı yapabiliyoruz ya da iptal edebiliyoruz.
                btnSetTaskCompleted.style.display = "block";
                btnSetTaskCancel.style.display = "block";
                btnSetTaskKeepGoing.style.display = "none";
                break;
            case STATUS.COMPLETE: // 1
                // task tamamlandı ise sadece devam ettirebiliyoruz. İptal Edemiyoruz.
                btnSetTaskCancel.style.display = "none";
                btnSetTaskKeepGoing.style.display = "block";
                btnSetTaskCompleted.style.display = "none";
                break;
            case STATUS.CANCEL: // 3
                //task iptal ise hiçbir şey yapamıyoruz.
                btnSetTaskCompleted.style.display = "none";
                btnSetTaskKeepGoing.style.display = "none";
                btnSetTaskCancel.style.display = "none";
                break;
            default:
                break;
        }
        const commentsList = document.getElementById('taskComments');
        document.getElementById("taskCode").innerText = task.code
        document.getElementById("taskTitle").innerText = task.title
        commentsList.innerHTML = '';

        // Mevcut yorumları ekleyin
        Object.values(task.comments || []).sort((a, b) => convertDate(b.date).getTime() - convertDate(a.date).getTime()).forEach(addCommentToDOM);
        //Object.values(task.comments || []).forEach(addCommentToDOM);

        // Yeni yorum için boş bir satır ekleyin
        const newCommentItem = createEditableCommentItem('', '', '');
        commentsList.appendChild(newCommentItem);

        //comment sayısını yaz
        document.getElementById("commentCountSpan").innerText = task.comments ? Object.keys(task.comments).length : 0;
    }

    function addCommentToDOM(comment) {
        const listItem = createEditableCommentItem(comment.text, comment.date, comment.id);
        document.getElementById('taskComments').appendChild(listItem);
    }

    function createEditableCommentItem(text, date, id) {
        const listItem = document.createElement('li');
        const commentContent = document.createElement('div');
        const commentDate = document.createElement('div');
        const saveButton = document.createElement('button');
        const commentContainer = document.createElement('div');

        // Yorum içeriği alanı
        commentContent.contentEditable = true;
        commentContent.className = 'comment-content ' + id;
        commentContent.innerText = text;
        commentContent.dataset.initialText = text;  // Başlangıç değerini saklayalım
        commentContent.addEventListener('input', handleCommentInput); // Yorum değişikliklerini dinleyin

        // Yorum tarihi alanı
        commentDate.className = 'comment-date';
        commentDate.innerText = date;

        // Yorum kaydetme butonu işlevi
        saveButton.className = 'save-comment-btn';
        saveButton.innerText = 'Kaydet';
        saveButton.id = id;
        saveButton.onclick = function () {
            //Eğer id'si varsa mevcut yorumu güncelle
            if (this.id) {
                let editedComment = document.getElementsByClassName(this.id)[1].textContent;
                let path = DB.TASK + selectedTask.id + "/" + "comments" + "/" + this.id;
                let updateData = {
                    text: editedComment,
                    date: DATE_NOW
                };
                firebase.database().ref(path).update(updateData, (error) => {
                    if (error) {
                        throw new Error("update comment error", error).stack;
                    } else {
                        console.log("updated comment successfully");
                        document.getElementById(this.id).style.display = "none";
                        updateLastUpdated();
                    }
                })
            }
            // Eğer id'si yoksa yeni yorum ekle
            else {
                let path = DB.TASK + selectedTask.id + "/" + "comments" + "/";
                const comments = document.getElementsByClassName("comment-content");
                let insertComment = getComment();
                let insertDate = DATE_NOW;
                let insertData = {
                    text: insertComment,
                    date: insertDate
                };
                firebase.database().ref(path).push().set(insertData, error => {
                    if (error) {
                        throw new Error("insert comment error", error).stack;
                    }
                    else {
                        getEmptyCommentButton().style.display = "none";
                        console.log("note inserted.")
                        updateLastUpdated();
                    }
                })
            }
            console.log(selectedTask);
        };
        saveButton.style.display = 'none'; // Başlangıçta butonu gizleyelim
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X'; // Silme butonu için basit bir metin
        deleteButton.className = 'delete-comment-btn ' + id;
        deleteButton.onclick = function () {
            let deletedCommentId = this.className.split(' ')[1];
            if (deletedCommentId != '') {
                if (confirm(deletedCommentId + " id'li yorum silinecek. Onaylıyor musunuz?")) {
                    let path = DB.TASK + selectedTask.id + "/" + "comments" + "/" + deletedCommentId;
                    firebase.database().ref(path).remove()
                        .then(function () {
                            listItem.remove();
                            updateLastUpdated();

                        })
                        .catch(function (error) {
                            throw new Error("delete comment error", error).stack;
                        });
                }
            }
        };

        commentContainer.insertBefore(deleteButton, commentContainer.firstChild); // Silme butonunu yorum içeriğinden önce ekleyin

        commentContainer.className = 'comment';

        commentContainer.appendChild(commentContent);
        commentContainer.appendChild(commentDate);
        commentContainer.appendChild(saveButton);
        listItem.appendChild(commentContainer);

        return listItem;
    }

    function handleCommentInput(event) {
        const saveButton = event.target.nextSibling.nextSibling;
        if (event.target.innerText.trim() !== '' && event.target.innerText !== event.target.dataset.initialText) {
            saveButton.style.display = 'block';
        } else {
            saveButton.style.display = 'none';
        }
    }

    function filterTasks() {
        const searchTerm = searchBox.value.toLowerCase();
        let result;
        result = tasks.filter(task =>
            task.code.toLowerCase().includes(searchTerm) ||
            task.header.toLowerCase().includes(searchTerm) ||
            task.header.toLowerCase().includes(searchTerm)
        );
        if (result.length == 0) {
            result = tasks.filter(task => {
                if (task.comments != undefined) {
                    let thisTaskComment = Object.values(task.comments);
                    if (thisTaskComment.length > 0) {
                        return thisTaskComment.some(comment => comment.text.toLowerCase().includes(searchTerm));
                    }
                    return false;
                }
                return false;

            });
        }

        renderTasks(result);
    }

    function filterTasksByStatus(status) {
        const filteredTasks = tasks.filter(task => task.status === status);
        renderTasks(filteredTasks);
        let message = "Filter: ";
        switch (status) {
            case STATUS.CONTINUING:
                message += CHOOSE_FILTER.CONTINUING;
                break;
            case STATUS.COMPLETE:
                message += CHOOSE_FILTER.COMPLETE;
                break;
            case STATUS.CANCEL:
                message += CHOOSE_FILTER.CANCEL;
                break;
            default:
                message += CHOOSE_FILTER.ALL;
                break;
        }
        chooseFilterSpanInfo.innerText = message;
    }

    function showAllTasks(params) {
        renderTasks(tasks);
        chooseFilterSpanInfo.innerText = "Filter: "+CHOOSE_FILTER.ALL;
    }

    function saveTask() {
        const labelType = document.getElementById("labelType").value;

        const code = document.getElementById("code").value;

        const header = document.getElementById("header").value;

        const taskType = document.getElementById("taskType").value;

        const title = document.getElementById("title").value;

        var taskObject = {

            code: labelType + "-" + code,
            header: header,
            type: taskType,
            status: "0",
            createdAt: DATE_NOW,
            title: title,
            lastUpdated: DATE_NOW,
            completionDate: "null",
            comments: {},
            cancelDate:"null"
        };
        FirebaseRealtime.SaveTask({
            path: DB.TASK,
            params: taskObject,
            done: (saveResponse) => {
                if (saveResponse) {
                    $('#taskAddModal').modal('hide');
                }
            },
            fail: (error) => {
                throw new Error("SaveTask Error").stack;
            }
        })
    }
    function setTaskCompleted() {
        FirebaseRealtime.UpdateTask({
            path: DB.TASK,
            where: { "key": selectedTask.id },
            params: { "status": STATUS.COMPLETE, "completionDate": DATE_NOW },
            done: (updateResponse) => {
                if (updateResponse) {
                    btnSetTaskCompleted.style.display = "none";
                    btnSetTaskKeepGoing.style.display = "block";
                    updateLastUpdated();
                }
            },
            fail: (error) => {
                throw new Error("UpdateTask eRROR").stack;
            }
        })
    }
    function setTaskKeepGoing(params) {
        FirebaseRealtime.UpdateTask({
            path: DB.TASK,
            where: { "key": selectedTask.id },
            params: { "status": STATUS.CONTINUING, "completionDate": "null" },
            done: (updateResponse) => {
                if (updateResponse) {
                    btnSetTaskKeepGoing.style.display = "none";
                    btnSetTaskCompleted.style.display = "block";
                    updateLastUpdated();
                }
            },
            fail: (error) => {
                throw new Error("UpdateTask eRROR").stack;
            }
        })
    }
    function setTaskCancel(){
        FirebaseRealtime.UpdateTask({
            path: DB.TASK,
            where: { "key": selectedTask.id },
            params: { "status": STATUS.CANCEL, "cancelDate": DATE_NOW },
            done: (updateResponse) => {
                if (updateResponse) {
                    btnSetTaskCancel.style.display = "none";
                    btnSetTaskKeepGoing.style.display = "block";
                    updateLastUpdated();
                }
            },
            fail: (error) => {
                throw new Error("UpdateTask eRROR").stack;
            }
        })
    }

    function getComment() {
        const comments = document.getElementsByClassName("comment-content");
        let insertComment;

        for (let i = 0; i < comments.length; i++) {
            if (comments[i].classList.length === 1) {
                insertComment = comments[i].textContent;
                break;
            }
        }
        return insertComment;
    }

    function getEmptyCommentButton() {
        const buttons = document.getElementsByClassName("save-comment-btn");
        let selectedButon;

        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].id.length == 0) {
                selectedButon = buttons[i];
                break;
            }
        }
        return selectedButon;
    }
    function updateLastUpdated() {
        firebase.database().ref(DB.TASK + selectedTask.id).update({ lastUpdated: DATE_NOW }, (error) => {
            if (error) {
                throw new Error("update task date error", error).stack;
            }
            else {
                console.log("updated task edited date successfully");
            }
        })
    }
    document.getElementById("filterIcon").addEventListener("click", function () {
        const menu = document.getElementById("filterMenu");
        menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
        event.stopPropagation();
    });
    document.addEventListener("click", function () {
        const menu = document.getElementById("filterMenu");
        if (menu.style.display === "block") {
            menu.style.display = "none";
        }
    });
    function convertDate(str) {
        const months = {
            "Oca": 0,
            "Şub": 1,
            "Mar": 2,
            "Nis": 3,
            "May": 4,
            "Haz": 5,
            "Tem": 6,
            "Ağu": 7,
            "Eyl": 8,
            "Eki": 9,
            "Kas": 10,
            "Ara": 11
        };

        const parts = str.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1]];
        const year = parseInt(parts[2], 10);
        const timeParts = parts[4].split(':');
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);
        const second = parseInt(timeParts[2], 10);

        return new Date(year, month, day, hour, minute, second);
    }
    function copyToClipboard() {
        navigator.clipboard.writeText(selectedTask.code).then(function() {
            alert("Panoya kopyalandı!");
        }, function() {
            /* clipboard write failed */
            alert("Panoya kopyalanırken hata oluştu!");
        });
    }

    FirebaseRealtime.QueryTasks({
        path: DB.TASK,
        done: (queryResults) => {
            for (var key in queryResults) {
                if (queryResults.hasOwnProperty(key)) {
                    queryResults[key].id = key;

                    // Eğer comments anahtarı varsa ve bu bir obje ise
                    if (queryResults[key].comments && typeof queryResults[key].comments === 'object') {
                        for (var commentKey in queryResults[key].comments) {
                            if (queryResults[key].comments.hasOwnProperty(commentKey)) {
                                queryResults[key].comments[commentKey].id = commentKey;
                            }
                        }
                    }
                }
            }
            tasks = Object.values(queryResults);
            renderTasks(tasks.filter(i => i.status == "0"));
            chooseFilterSpanInfo.innerText = "Filter: "+CHOOSE_FILTER.CONTINUING;
        },
        fail: (error) => {
            throw new Error("QueryTasks Error").stack;
        }
    })

});

