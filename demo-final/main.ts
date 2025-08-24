import { createApp } from 'vue'
import App from './App.vue'
import { Button, Cell, CellGroup, NoticeBar, Tag, Loading, Empty, Icon, Field, Checkbox, Popup, Toast, Dialog } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(NoticeBar)
app.use(Tag)
app.use(Loading)
app.use(Empty)
app.use(Icon)
app.use(Field)
app.use(Checkbox)
app.use(Popup)
app.use(Toast)
app.use(Dialog)
app.mount('#app')