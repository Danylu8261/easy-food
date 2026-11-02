 
document.addEventListener('DOMContentLoaded', () => {
  verificarSessao();
  carregarRestaurantes();

  const formRestaurante = document.getElementById('restaurant-form');
  if (formRestaurante) {
    formRestaurante.addEventListener('submit', guardarRestaurante);
  }
});

async function verificarSessao() {
  const token = localStorage.getItem('token');
  const userHeader = document.getElementById('user-header');
  if (!userHeader) return;

  if (!token) {
    userHeader.innerHTML = '<span>Não autenticado</span>';
    return;
  }

  try {
    const res = await fetch('/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const user = await res.json();
      userHeader.innerHTML = `👤 <strong>${user.name}</strong> <button class="btn-logout" onclick="logout()">Sair</button>`;
    }
  } catch (e) {
    console.error('Erro ao validar sessão:', e);
  }
}

function logout() {
  localStorage.removeItem('token');
  location.reload();
}

async function carregarRestaurantes() {
  const container = document.getElementById('restaurants-list');
  if (!container) return;

  try {
    const response = await fetch('/restaurants');
    const restaurantes = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Erro ao carregar restaurantes.</p>';
      return;
    }

    if (restaurantes.length === 0) {
      container.innerHTML = '<p>Nenhum restaurante cadastrado.</p>';
      return;
    }

    container.innerHTML = restaurantes.map(r => `
      <div class="restaurant-card">
        <img
          src="${r.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}"
          alt="${r.name}"
        />
        <h3>${r.name}</h3>
        <p><strong>Categoria:</strong> ${r.category}</p>
        <p><strong>Classificação:</strong> ⭐ ${r.rating || 5.0}</p>

        <button class="btn-delete" onclick="deletarRestaurante(${r.id})">
          Excluir
        </button>

        <h3>Cardápio</h3>
        <div id="dishes-${r.id}">
          <p>Carregando pratos...</p>
        </div>
      </div>
    `).join('');

    restaurantes.forEach(r => carregarPratos(r.id));

  } catch (error) {
    console.error('Erro ao carregar restaurantes:', error);
    container.innerHTML = '<p>Erro de ligação ao servidor.</p>';
  }
}

async function carregarPratos(restaurantId) {
  const container = document.getElementById(`dishes-${restaurantId}`);
  if (!container) return;

  try {
    const response = await fetch(`/dishes/restaurant/${restaurantId}`);
    const pratos = await response.json();

    if (!response.ok) {
      container.innerHTML = '<p>Erro ao carregar pratos.</p>';
      return;
    }

    if (pratos.length === 0) {
      container.innerHTML = '<p>Nenhum prato cadastrado.</p>';
      return;
    }

    container.innerHTML = pratos.map(prato => `
      <div class="dish-card">
        ${
          prato.imageUrl
            ? `<img src="${prato.imageUrl}" alt="${prato.name}" class="dish-image">`
            : '<p>Foto ainda não disponível.</p>'
        }
        <h4>${prato.name}</h4>
        <p>${prato.description || ''}</p>
        <p><strong>Preço:</strong> R$ ${Number(prato.price).toFixed(2)}</p>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar pratos:', error);
    container.innerHTML = '<p>Erro ao carregar pratos.</p>';
  }
}

async function guardarRestaurante(event) {
  event.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Precisa de estar autenticado para cadastrar um restaurante.');
    return;
  }

  const nameInput = document.getElementById('name');
  const categoryInput = document.getElementById('category');
  const imageUrlInput = document.getElementById('imageUrl');

  const payload = {
    name: nameInput ? nameInput.value : '',
    category: categoryInput ? categoryInput.value : '',
    imageUrl: imageUrlInput ? imageUrlInput.value : ''
  };

  try {
    const response = await fetch('/restaurants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Restaurante cadastrado com sucesso!');
      if (event.target) event.target.reset();
      carregarRestaurantes();
    } else {
      alert(data.message || data.error || 'Erro ao cadastrar restaurante.');
    }
  } catch (error) {
    console.error('Erro na submissão:', error);
    alert('Não foi possível conectar ao servidor.');
  }
}

async function deletarRestaurante(id) {
  const confirmacao = confirm(
    'Tem a certeza que deseja excluir este restaurante?'
  );
  if (!confirmacao) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Precisa de estar autenticado para eliminar um restaurante.');
    return;
  }

  try {
    const response = await fetch(`/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert('Restaurante excluído com sucesso!');
      carregarRestaurantes();
    } else {
      alert(data.message || data.error || 'Erro ao apagar o restaurante.');
    }
  } catch (error) {
    console.error('Erro ao excluir restaurante:', error);
    alert('Não foi possível conectar ao servidor.');
  }
}
