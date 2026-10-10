const dialog = document.getElementById('order-dialog');

if (dialog) {
    const form = document.getElementById('order-form');
    const productInput = document.getElementById('order-product');
    const productName = document.getElementById('order-product-name');
    const successMessage = document.getElementById('order-success');
    const closeButton = document.getElementById('close-order-dialog');

    document.querySelectorAll('[data-product]').forEach((button) => {
        button.addEventListener('click', () => {
            form.reset();
            successMessage.hidden = true;
            productInput.value = button.dataset.product;
            productName.textContent = button.dataset.product;
            dialog.showModal();
        });
    });

    closeButton.addEventListener('click', () => {
        dialog.close();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        successMessage.hidden = false;
        form.reset();

        setTimeout(() => {
            dialog.close();
        }, 1500);
    });
}
