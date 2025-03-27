document.addEventListener("DOMContentLoaded", function () {
    const dataTable = document.getElementById("dataTable");

    // Buscar os contatos salvos no LocalStorage
    const contatos = JSON.parse(localStorage.getItem("contatos")) || [];

    // Se não houver contatos, exibe uma mensagem na tabela
    if (contatos.length === 0) {
        dataTable.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhum contato cadastrado.</td></tr>`;
        return;
    }

    // Preencher a tabela com os dados do LocalStorage
    contatos.forEach(contato => {
        const row = dataTable.insertRow();

        row.insertCell(0).textContent = contato.nome;
        row.insertCell(1).textContent = contato.email;
        row.insertCell(2).textContent = contato.telefone;
    });
});