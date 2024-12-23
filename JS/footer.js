
async function loadFooter() {
    const response = await fetch('footer.html'); // Путь к вашему файлу футера
    if (response.ok) {
        const footerContent = await response.text();
        document.getElementById('footer-container').innerHTML = footerContent;
    } else {
        console.error('Ошибка при загрузке футера:', response.statusText);
    }
}

loadFooter();
async function openPolicyWindow() {
    const newWindow = window.open("", "newWindow", "width=600,height=400");

    // Создаем HTML-код для нового окна
    const htmlContent = `
        <html>
        <head>
            <title>Политика обработки персональных данных</title>
        </head>
        <body>
            <iframe src="Politika_obrabotki_personalnyh_dannyh_2024.pdf" 
                    width="100%" height="100%" style="border:none;">
            </iframe>
        </body>
        </html>
    `;

    newWindow.document.write(htmlContent);
    newWindow.document.close();
}

