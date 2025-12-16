import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/md-dark-indigo/theme.css'

// PrimeVue Components
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import SplitButton from 'primevue/splitbutton';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import ProgressBar from 'primevue/progressbar';
import Badge from 'primevue/badge';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const app = createApp(App);

// Usar PrimeVue
app.use(PrimeVue, {
    theme: {
        preset: 'Aura'
    }
});

// Usar ToastService
app.use(ToastService);

// Registrar componentes globalmente
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Button', Button);
app.component('Checkbox', Checkbox);
app.component('Message', Message);
app.component('Toast', Toast);
app.component('Dialog', Dialog);
app.component('Card', Card);
app.component('Panel', Panel);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Toolbar', Toolbar);
app.component('SplitButton', SplitButton);
app.component('Dropdown', Dropdown);
app.component('Calendar', Calendar);
app.component('ProgressBar', ProgressBar);
app.component('Badge', Badge);
app.component('Chip', Chip);
app.component('Tag', Tag);
app.component('Avatar', Avatar);
app.component('Menu', Menu);
app.component('Sidebar', Sidebar);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);

app.mount('#app');

