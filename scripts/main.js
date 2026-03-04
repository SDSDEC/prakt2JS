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
            <div class="board">
                <div class="column" v-for="(column, colIndex) in columns" :key="colIndex">
                    <h2>{{ column.name }} ({{ column.cards.length }})</h2>
                    <div class="card" v-for="(card, cardIndex) in column.cards" :key="card.id" :style="{ backgroundColor: card.color }">
                        <h3>{{ card.title }}</h3>
                        <ul>
                            <li v-for="(item, i) in card.items" :key="i">
                                <input type="checkbox"
                                    v-model="item.completed"
                                    @change="handleItemChange(card, colIndex, cardIndex)"
                                    :disabled="isFirstColumnBlocked && colIndex === 0">
                                    {{ item.text }}
                            </li>
                        </ul>
                    </div>
                </div>
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
    computed: {
        firstColumnFull() {
            return this.columns[0].cards.length >= 3;
        },
        isFirstColumnBlocked() {
            if (this.columns[1].cards.length < 5) return false;
            return this.columns[0].cards.some(card=> {
                const percent = this.getCardPercent(card);
                return percent > 50 && percent < 100;
            });
        }
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

            const newCard = {
                id: Date.now(),
                title: this.newCardTitle,
                items: this.newCardItems.map(text => ({text, completed: false})),
                color: '#ffffff',
                completed: null
            };
            this.columns[0].cards.push(newCard);
            this.newCardTitle = '';
            this.newCardItems = ['', '', ''];
            }
        },
        getCardPercent(card) {
            const total = card.items.length;
            const completed = card.items.filter(i => i.completed).length;
            return total === 0 ? 0 : (completed / total) * 100;
        }

})