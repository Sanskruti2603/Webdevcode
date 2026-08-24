/* =========================================
   DIGILOCKER 2.0 JAVASCRIPT
   MyGov Vault
========================================= */


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId, clickedElement) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        link.classList.remove("active");
    });

    if (clickedElement) {
        clickedElement.classList.add("active");
    }

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   MOBILE SIDEBAR
========================================= */

function toggleSidebar() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

}


/* =========================================
   DARK MODE
========================================= */

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    const icon = document.querySelector(".icon-btn i");

    if (document.body.classList.contains("dark")) {

        if (icon) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        }

        showToast("Dark mode enabled");

    } else {

        if (icon) {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }

        showToast("Light mode enabled");
    }

}


/* =========================================
   DOCUMENT SEARCH
========================================= */

function searchDocuments() {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const searchValue = searchInput.value.toLowerCase().trim();

    const documents = document.querySelectorAll(".document-row");

    documents.forEach(documentItem => {

        const documentName =
            (documentItem.getAttribute("data-name") || "").toLowerCase();

        if (documentName.includes(searchValue)) {

            documentItem.style.display = "flex";

        } else {

            documentItem.style.display = "none";

        }

    });

}


/* =========================================
   DOCUMENT MODAL
========================================= */

function openDocument(title, issuer, status) {

    const modalTitle = document.getElementById("modalTitle");
    const modalIssuer = document.getElementById("modalIssuer");
    const statusElement = document.getElementById("modalStatus");
    const documentModal = document.getElementById("documentModal");

    if (!documentModal) {
        return;
    }

    if (modalTitle) {
        modalTitle.textContent = title;
    }

    if (modalIssuer) {
        modalIssuer.textContent = issuer;
    }

    if (statusElement) {

        if (status === "Verified") {

            statusElement.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Verified Document';

            statusElement.style.color = "#16a34a";
            statusElement.style.background = "#f0fdf4";

        } else {

            statusElement.innerHTML =
                '<i class="fa-solid fa-clock"></i> Verification Pending';

            statusElement.style.color = "#f59e0b";
            statusElement.style.background = "#fffbeb";
        }
    }

    documentModal.classList.add("show");

}


/* =========================================
   CLOSE DOCUMENT MODAL
========================================= */

function closeModal() {

    const modal = document.getElementById("documentModal");

    if (modal) {
        modal.classList.remove("show");
    }

}


/* =========================================
   UPLOAD MODAL
========================================= */

function openUpload() {

    const uploadModal = document.getElementById("uploadModal");

    if (uploadModal) {
        uploadModal.classList.add("show");
    }

}


function closeUpload() {

    const uploadModal = document.getElementById("uploadModal");

    if (uploadModal) {
        uploadModal.classList.remove("show");
    }

}


/* =========================================
   FILE SELECTION
========================================= */

function fileSelected(input) {

    const fileName = document.getElementById("selectedFile");

    if (!fileName || !input) {
        return;
    }

    if (input.files.length > 0) {

        fileName.textContent =
            "Selected: " + input.files[0].name;

    }

}


/* =========================================
   UPLOAD DOCUMENT
========================================= */

function uploadDocument() {

    const input = document.getElementById("fileInput");

    if (!input) {
        return;
    }

    if (input.files.length === 0) {

        showToast("Please select a document first");

        return;
    }

    showToast("Document uploaded successfully");

    closeUpload();

}


/* =========================================
   NOTIFICATIONS
========================================= */

function openNotifications() {

    const notificationPanel =
        document.getElementById("notificationPanel");

    const profileDropdown =
        document.getElementById("profileDropdown");

    if (notificationPanel) {
        notificationPanel.classList.toggle("show");
    }

    if (profileDropdown) {
        profileDropdown.classList.remove("show");
    }

}


function closeNotifications() {

    const notificationPanel =
        document.getElementById("notificationPanel");

    if (notificationPanel) {
        notificationPanel.classList.remove("show");
    }

}


/* =========================================
   PROFILE
========================================= */

function openProfile() {

    const profileDropdown =
        document.getElementById("profileDropdown");

    const notificationPanel =
        document.getElementById("notificationPanel");

    if (profileDropdown) {
        profileDropdown.classList.toggle("show");
    }

    if (notificationPanel) {
        notificationPanel.classList.remove("show");
    }

}


/* =========================================
   TOAST MESSAGE
========================================= */

let toastTimer;


function showToast(message) {

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "DigiLocker 2.0 - MyGov Vault loaded successfully."
    );


    /* =====================================
       FILTER BUTTONS
    ===================================== */

    const filters = document.querySelectorAll(".filter");

    filters.forEach(filter => {

        filter.addEventListener("click", function () {

            filters.forEach(item => {
                item.classList.remove("active");
            });

            this.classList.add("active");

            showToast(
                "Showing " +
                this.textContent.trim()
            );

        });

    });


    /* =====================================
       SEARCH ENTER KEY
    ===================================== */

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                searchDocuments();
            }

        });

    }

});


/* =========================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================= */

window.addEventListener("click", function (event) {

    const documentModal =
        document.getElementById("documentModal");

    const uploadModal =
        document.getElementById("uploadModal");

    if (documentModal && event.target === documentModal) {
        closeModal();
    }

    if (uploadModal && event.target === uploadModal) {
        closeUpload();
    }

});


/* =========================================
   CTRL + K SEARCH
========================================= */

document.addEventListener("keydown", function (event) {

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        const search =
            document.getElementById("searchInput");

        if (search) {

            search.focus();

        }

    }

});


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeModal();

        closeUpload();

        closeNotifications();

        const profileDropdown =
            document.getElementById("profileDropdown");

        if (profileDropdown) {
            profileDropdown.classList.remove("show");
        }

    }

});