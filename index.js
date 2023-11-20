const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const Handlebars = require('handlebars');
const mysql = require('mysql');

const app = express();

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());
app.use(express.static('public'));

const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

app.get('/cursos', (req, res) => {
    const query = 'SELECT destinoImagem, tituloCurso, descricaoCurso FROM curso';
    conn.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao obter cursos do banco de dados.');
        } else {
            res.render('cursos', { user: req.session.user, cursos: results });
        }
    });
});

app.get('/', (req, res) => {
    const query = 'SELECT destinoImagem, tituloCurso, descricaoCurso FROM curso';
    conn.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao obter cursos do banco de dados.');
        } else {
            res.render('index', { user: req.session.user, cursos: results });
        }
    });
});

app.get('/adm', (req, res) => {
    const query = 'SELECT idUsuario, nome, email FROM usuario';
    conn.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao obter usuários do banco de dados.');
        } else {
            res.render('adm', { user: req.session.user, usuarios: results });
        }
    });
});

app.get('/minhaConta', (req, res) => {
    res.render('minhaConta', {user: req.session.user});
});

app.get('/sobre', (req, res) => {
    res.render('sobre', {user: req.session.user});
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/cadastrarAluno', (req, res) => {
    res.render('cadastrarAluno');
});

app.get('/cadastrarProfessor', (req, res) => {
    res.render('cadastrarProfessor');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/login');
    });
});

app.post('/adm/delete/:id', checkAuth, (req, res) => {
    const userId = req.params.id;
    const deleteQuery = 'DELETE FROM usuario WHERE id = ?';
    conn.query(deleteQuery, [userId], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao excluir usuário do banco de dados.');
        } else {
            res.redirect('/adm');
        }
    });
});

app.post('/users/login', (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    const query = 'SELECT * FROM usuario WHERE email = ? AND senha = ?';
    
    conn.query(query, [email, senha], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao tentar fazer login.');
        } else {
            if (results.length > 0) {
                const usuario = results[0];
                console.log('usuario encontrado');
                req.session.user = {
                    nome: usuario.nome,
                    email: usuario.email,
                    senha: usuario.senha,
                    dataNascimento: usuario.dataNascimento,
                    cpf: usuario.cpf,
                    tipo: usuario.tipo
                };
                res.redirect('/');
            } else {
                res.status(401).send('Credenciais incorretas. Verifique seu e-mail e senha.');
            }
        }
        
    });
});

app.post('/users/cadastroAluno', (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;
    const cpf = req.body.cpf;
    const dataNascimento = req.body.dataNascimento;

    console.log(nome, email, senha, cpf, dataNascimento);

    const query = 'INSERT INTO usuario (nome, email, senha, dataNascimento, cpf, tipo) VALUES (?, ?, ?, ?, ?, ?)';
    const tipoUsuario = 'Aluno';

    conn.query(query, [nome, email, senha, dataNascimento, cpf, tipoUsuario], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao cadastrar usuário.');
        } else {
            res.redirect('/login');
        }
    });
});

app.post('/users/cadastroProfessor', (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;
    const cpf = req.body.cpf;
    const dataNascimento = req.body.dataNascimento;
    const comprovanteExperiencia = req.files.comprovanteExperiencia.data;

    console.log(email, senha, cpf, dataNascimento, comprovanteExperiencia);

    const query = 'INSERT INTO professor (email, senha, cpf, dataNascimento, comprovanteExperiencia, tipo) VALUES (?, ?, ?, ?, ?, ?)';
    const tipoUsuario = 'Professor';

    conn.query(query, [email, senha, cpf, dataNascimento, comprovanteExperiencia, tipoUsuario], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao cadastrar professor.');
        } else {
            res.redirect('/login');
        }
    });
});

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodemysql'
});

conn.connect(function(err){
    if(err)
        console.log(err);
    else
        console.log("Conectou ao MySQL");

        app.listen(3000, () => {
            console.log("Servidor Ligado");
        })
});

process.on('SIGINT', () => {
    conn.end((err) => {
        console.log('Conexão com o MySQL encerrada.');
        process.exit(err ? 1 : 0);
    });
});
