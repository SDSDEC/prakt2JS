new Vue({
    el: '#app',
    template: `
        <div>
            <div class="create-card">
                <h3>Создать карточку</h3>
                <div>
                    <label>Заголовок:</label>
                    <input v-model="newCardTitle" placeholder="Заголовок">
                </div>
                <div>
                    <label>Пункты:</label>
                    <div v-for="(item, index) in newCardItems" :key="index">
                        <input v-model="newCardItems[index]" placeholder="Пункт">
                        <button @click="removeItem(index)" v-if="newCardItems.length > 3">Удалить</button>
                    </div>
                    <button @click="addItem" v-if="newCardItems.length < 5">Добавить пункт</button>
                </div>
                <button @click="createCard">Создать карточку</button>
                <p v-if="firstColumnFull" class="warning">Первая колонка заполнена (максимум 3)</p>
            </div>  
        </div>        
    `,
    data: {
        columns: [
            { name: 'Нужно выполнить (макс.3)', cards: [] },
            { name: 'Выполняется (макс.5)', cards: [] },
            { name: 'Выполнено', cards: [] }
        ],
        newCardTitle: '',
        newCardItems: ['', '', '']
    },
    methods: {
        addItem() {
            if (this.newCardItems.length < 5) {
                this.newCardItems.push('');
            }
        },
        removeItem(index) {
            if (this.newCardItems.length > 3) {
                this.newCardItems.splice(index, 1);
            }
        },
        createCard() {
            if (!this.newCardTitle) return alert('Введите заголовок');
            if (this.newCardItems.some(item => !item.trim())) return alert('Заполните все пункты');
        }
    }
})