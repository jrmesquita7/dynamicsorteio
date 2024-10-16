let names = [];
let groupScores = [];  // Armazena a pontuação de cada grupo

// Função para embaralhar um array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Processa o arquivo Excel e coleta os nomes
function processFile() {
    const fileInput = document.getElementById('upload');
    const numGroups = document.getElementById('numGroups').value;
    
    if (!fileInput.files.length) {
        alert("Por favor, faça o upload de um arquivo Excel.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Extrai os nomes da primeira coluna
        names = rows.map(row => row[0]).filter(Boolean); // Filtra células vazias

        if (names.length === 0) {
            alert("Nenhum nome foi encontrado no arquivo.");
            return;
        }

        // Embaralha os nomes
        shuffle(names);

        // Inicializa a pontuação dos grupos
        groupScores = Array.from({ length: numGroups }, () => 0);

        // Divide os nomes em grupos
        const groups = divideIntoGroups(names, numGroups);
        displayGroups(groups);
    };

    reader.readAsArrayBuffer(file);
}

// Função para dividir os nomes em grupos
function divideIntoGroups(array, numGroups) {
    const groups = Array.from({ length: numGroups }, () => []);
    array.forEach((name, index) => {
        groups[index % numGroups].push(name);
    });
    return groups;
}

// Exibe os grupos na página e adiciona campos de pontuação
function displayGroups(groups) {
    const groupsDiv = document.getElementById('groups');
    groupsDiv.innerHTML = ''; // Limpa a exibição anterior

    groups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.innerHTML = `
            <h2>Grupo ${index + 1} - Pontuação: <span id="score-${index}">0</span></h2>
            <ul>${group.map(name => `<li>${name}</li>`).join('')}</ul>
            <div class="group-score">
                <input type="number" id="points-${index}" class="points-input" min="0" value="0">
                <button onclick="addPoints(${index})">Adicionar Pontos</button>
                <button onclick="removePoints(${index})" style="background-color: #e74c3c; color: white;">Remover Pontos</button>
            </div>
        `;
        groupsDiv.appendChild(groupDiv);
    });
}

// Adiciona pontos ao grupo e atualiza a exibição
function addPoints(groupIndex) {
    const pointsInput = document.getElementById(`points-${groupIndex}`);
    const points = parseInt(pointsInput.value);
    if (isNaN(points) || points < 0) {
        alert("Por favor, insira um valor de pontos válido.");
        return;
    }

    // Atualiza a pontuação acumulada do grupo
    groupScores[groupIndex] += points;

    // Atualiza a exibição da pontuação
    const scoreSpan = document.getElementById(`score-${groupIndex}`);
    scoreSpan.textContent = groupScores[groupIndex];

    // Limpa o campo de input de pontos
    pointsInput.value = "0";
}

// Remove pontos do grupo e atualiza a exibição
function removePoints(groupIndex) {
    const pointsInput = document.getElementById(`points-${groupIndex}`);
    const points = parseInt(pointsInput.value);
    if (isNaN(points) || points < 0) {
        alert("Por favor, insira um valor de pontos válido.");
        return;
    }

    // Atualiza a pontuação acumulada do grupo
    groupScores[groupIndex] -= points;

    // Garantir que a pontuação não seja negativa
    if (groupScores[groupIndex] < 0) {
        groupScores[groupIndex] = 0;
    }

    // Atualiza a exibição da pontuação
    const scoreSpan = document.getElementById(`score-${groupIndex}`);
    scoreSpan.textContent = groupScores[groupIndex];

    // Limpa o campo de input de pontos
    pointsInput.value = "0";
}

// Avalia o grupo vencedor com a maior pontuação
function evaluateWinner() {
    let maxScore = Math.max(...groupScores);
    let winningGroups = groupScores
        .map((score, index) => ({ score, index }))
        .filter(group => group.score === maxScore);

    const winnerDiv = document.getElementById('winner');
    
    if (winningGroups.length > 1) {
        winnerDiv.textContent = `Há um empate entre os grupos: ${winningGroups.map(g => g.index + 1).join(', ')} com ${maxScore} pontos!`;
    } else {
        const winnerIndex = winningGroups[0].index;
        winnerDiv.textContent = `O grupo ${winnerIndex + 1} é o vencedor com ${maxScore} pontos!`;
    }
}
