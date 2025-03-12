class Toasts {

    constructor(options) {
        let defaults = {
            position: 'top-right',
            stack: [],
            offsetX: 20,
            offsetY: 20,
            gap: 20,
            numToasts: 0,
            duration: '.5s',
            timing: 'ease',
            dimOld: true
        };
        this.options = Object.assign(defaults, options);
    }

    push(obj) {
        this.numToasts++;
        let toast = document.createElement(obj.link ? 'a' : 'div');
        if (obj.link) {
            toast.href = obj.link;
            toast.target = obj.linkTarget ? obj.linkTarget : '_self';
        }
        toast.className = 'toast-notification' + (obj.style ? ' toast-notification-' + obj.style : '') + ' toast-notification-' + this.position;
        toast.innerHTML = `
            <div class="toast-notification-wrapper">
                ${obj.title ? '<h3 class="toast-notification-header">' + obj.title + '</h3>' : ''}
                ${obj.content ? '<div class="toast-notification-content">' + obj.content + '</div>' : ''}
            </div>
            ${obj.closeButton == null || obj.closeButton === true ? '<button class="toast-notification-close">&times;</button>' : ''}
        `;
        document.body.appendChild(toast);
        toast.getBoundingClientRect();
        if (this.position == 'top-left') {
            toast.style.top = 0;
            toast.style.left = this.offsetX + 'px';
        } else if (this.position == 'top-center') {
            toast.style.top = 0;
            toast.style.left = 0;
        } else if (this.position == 'top-right') {
            toast.style.top = 0;
            toast.style.right = this.offsetX + 'px';
        } else if (this.position == 'bottom-left') {
            toast.style.bottom = 0;
            toast.style.left = this.offsetX + 'px';
        } else if (this.position == 'bottom-center') {
            toast.style.bottom = 0;
            toast.style.left = 0;
        } else if (this.position == 'bottom-right') {
            toast.style.bottom = 0;
            toast.style.right = this.offsetX + 'px';
        }
        if (obj.width || this.width) {
            toast.style.width = (obj.width || this.width) + 'px';
        }
        toast.dataset.transitionState = 'queue';
        let index = this.stack.push({ element: toast, props: obj, offsetX: this.offsetX, offsetY: this.offsetY, index: 0 });
        this.stack[index-1].index = index-1;
        if (toast.querySelector('.toast-notification-close')) {
            toast.querySelector('.toast-notification-close').onclick = event => {
                event.preventDefault();
                this.closeToast(this.stack[index-1]);
            };
        }
        if (obj.link) {
            toast.onclick = () => this.closeToast(this.stack[index-1]);
        }
        this.openToast(this.stack[index-1]);
        if (obj.onOpen) obj.onOpen(this.stack[index-1]);
    }

    openToast(toast) {
        if (this.isOpening() === true) {
            return false;
        }
        toast.element.dataset.transitionState = 'opening';
        toast.element.style.transition = this.duration + ' transform ' + this.timing;
        this._transformToast(toast);
        toast.element.addEventListener('transitionend', () => {
            if (toast.element.dataset.transitionState == 'opening') {
                toast.element.dataset.transitionState = 'complete';
                for (let i = 0; i < this.stack.length; i++) {
                    if (this.stack[i].element.dataset.transitionState == 'queue') {
                        this.openToast(this.stack[i]);
                    }
                }
                if (toast.props.dismissAfter) {
                    this.closeToast(toast, toast.props.dismissAfter);
                }
            }
        });
        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].element.dataset.transitionState == 'complete') {
                this.stack[i].element.dataset.transitionState = 'opening';
                this.stack[i].element.style.transition = this.duration + ' transform ' + this.timing + (this.dimOld ? ', ' + this.duration + ' opacity ease' : '');
                if (this.dimOld) {
                    this.stack[i].element.classList.add('toast-notification-dimmed');
                }
                this.stack[i].offsetY += toast.element.offsetHeight + this.gap;
                this._transformToast(this.stack[i]);
            }
        }
        return true;
    }

    closeToast(toast, delay = null) {
        if (this.isOpening() === true) {
            setTimeout(() => this.closeToast(toast, delay), 100);
            return false;
        }
        if (toast.element.dataset.transitionState == 'close') {
            return true;
        }
        if (toast.element.querySelector('.toast-notification-close')) {
            toast.element.querySelector('.toast-notification-close').onclick = null;
        }
        toast.element.dataset.transitionState = 'close';
        toast.element.style.transition = '.2s opacity ease' + (delay ? ' ' + delay : '');
        toast.element.style.opacity = 0;
        toast.element.addEventListener('transitionend', () => {
            if (toast.element.dataset.transitionState == 'close') {
                let offsetHeight = toast.element.offsetHeight;
                if (toast.props.onClose) toast.props.onClose(toast);
                toast.element.remove();
                for (let i = 0; i < toast.index; i++) {
                    this.stack[i].element.style.transition = this.duration + ' transform ' + this.timing;
                    this.stack[i].offsetY -= offsetHeight + this.gap;
                    this._transformToast(this.stack[i]);
                }
                let focusedToast = this.getFocusedToast();
                if (focusedToast) {
                    focusedToast.element.classList.remove('toast-notification-dimmed');
                }
            }
        });
        return true;
    }

    isOpening() {
        let opening = false;
        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].element.dataset.transitionState == 'opening') {
                opening = true;
            }
        }
        return opening;
    }

    getFocusedToast() {
        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].offsetY == this.offsetY) {
                return this.stack[i];
            }
        }
        return false;
    }

    _transformToast(toast) {
        if (this.position == 'top-center') {
            toast.element.style.transform = `translate(calc(50vw - 50%), ${toast.offsetY}px)`;
        } else if (this.position == 'top-right' || this.position == 'top-left') {
            toast.element.style.transform = `translate(0, ${toast.offsetY}px)`;
        } else if (this.position == 'bottom-center') {
            toast.element.style.transform = `translate(calc(50vw - 50%), -${toast.offsetY}px)`;            
        } else if (this.position == 'bottom-left' || this.position == 'bottom-right') {
            toast.element.style.transform = `translate(0, -${toast.offsetY}px)`;
        }
    }

    set stack(value) {
        this.options.stack = value;
    }

    get stack() {
        return this.options.stack;
    }

    set position(value) {
        this.options.position = value;
    }

    get position() {
        return this.options.position;
    }

    set offsetX(value) {
        this.options.offsetX = value;
    }

    get offsetX() {
        return this.options.offsetX;
    }

    set offsetY(value) {
        this.options.offsetY = value;
    }

    get offsetY() {
        return this.options.offsetY;
    }

    set gap(value) {
        this.options.gap = value;
    }

    get gap() {
        return this.options.gap;
    }

    set numToasts(value) {
        this.options.numToasts = value;
    }

    get numToasts() {
        return this.options.numToasts;
    }

    set width(value) {
        this.options.width = value;
    }

    get width() {
        return this.options.width;
    }

    set duration(value) {
        this.options.duration = value;
    }

    get duration() {
        return this.options.duration;
    }

    set timing(value) {
        this.options.timing = value;
    }

    get timing() {
        return this.options.timing;
    }

    set dimOld(value) {
        this.options.dimOld = value;
    }

    get dimOld() {
        return this.options.dimOld;
    }

}

const $ = (elemento) => document.querySelector(elemento);

const toasts = new Toasts({
    offsetX: 20, // 20px
    offsetY: 20, // 20px
    gap: 20, // The gap size in pixels between toasts
    width: 400, // 400px
    timing: 'ease', // See list of available CSS transition timings
    duration: '.5s', // Transition duration
    dimOld: true, // Dim old notifications while the newest notification stays highlighted
    position: 'top-center' // top-left | top-center | top-right | bottom-left | bottom-center | bottom-right
});

function validarEmail(email) {
    let emailPattern = /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/
    return emailPattern.test(email);
}

function validarTelefone(telefone) {
    let telefonePattern = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
    return telefonePattern.test(telefone);
}

// inputs
let nomeInput = $('#nome');
let emailInput = $('#email');
let telefoneInput = $('#telefone');
let botaoAdicionar = $('#btnAdicionar');
let botaoLimpar = $('#btnLimpar');
let botaoProximaPagina = $('#btnProximaPagina');

// validacoes
let validNome, validEmail, validTelefone = false;

// Validar nome
nomeInput.addEventListener('keyup', () => {
    if(nomeInput.value.length <= 2) {
        nomeInput.classList.add('is-invalid')
    } else {
        nomeInput.classList.remove('is-invalid')
        nomeInput.classList.add('is-valid')
        validNome = true;
    }
})

//validar email
emailInput.addEventListener('keyup', () => {
    if(!validarEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid')
    } else {
        emailInput.classList.remove('is-invalid')
        emailInput.classList.add('is-valid')
        validEmail = true;
    }
})

// Validar telefone
telefoneInput.addEventListener('keyup', () => {
    if (!validarTelefone(telefoneInput.value)) {
        telefoneInput.classList.add('is-invalid');
    } else {
        telefoneInput.classList.remove('is-invalid');
        telefoneInput.classList.add('is-valid');
        validTelefone = true;
    }
});

//Cadastrar contato
botaoAdicionar.addEventListener('click', (event) => {
    event.preventDefault();

    if(!validNome || !validEmail || !validTelefone) {

        toasts.push({
            title: 'Erro',
            content: 'Preencha todos os campos corretamente!',
            style: 'error',
            dismissAfter: '3s'
        });

        return;
    }

    let listaContatos = JSON.parse(localStorage.getItem('contatos')) || [];

    var isValid = true;

    listaContatos.forEach(contato => {
        if (contato.email === emailInput.value) {
            isValid = false;
        }
    });

    if (!isValid) {

        toasts.push({
            title: 'Erro',
            content: 'Email já cadastrado!',
            style: 'error',
            dismissAfter: '3s'
        });

        return;
    }

    listaContatos.push(
        {
            nome: nomeInput.value,
            email: emailInput.value,
            telefone: telefoneInput.value
        }
    )

    localStorage.setItem('contatos', JSON.stringify(listaContatos));

    toasts.push({
        title: 'Sucesso',
        content: 'Contato cadastrado com sucesso!',
        style: 'success',
        dismissAfter: '3s'
    });

    setTimeout(() => {
        window.location.href = "./index.html";
    }, 1500);
});

// Limpar campos
botaoLimpar.addEventListener('click', () => {
    nomeInput.value = '';
    emailInput.value = '';
    telefoneInput.value = '';
    nomeInput.classList.remove('is-valid');
    emailInput.classList.remove('is-valid');
    telefoneInput.classList.remove('is-valid');
    validNome = false;
    validEmail = false;
    validTelefone = false;
});

// botao proxima pagina
botaoProximaPagina.addEventListener('click', () => {
    window.location.href = "./listacontatos.html";
});