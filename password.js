export {encode_methods, generate_password};

class Encode_Method {
    constructor(name, func) {
        this.name = name;
        this.func = func;
    }
};

const range = (start, end) => [...Array(end-start+1).keys()].map(i => i+start);

let chars_code = range(33, 126);

const encode_methods = {
    'matrix': new Encode_Method('Matrix product', (pwd, secret_keys) => {
        const column_matrix_to_string = mat => mat.map(c => String.fromCharCode(chars_code[c % chars_code.length])).join('');
        const product = (m1, m2) => m1.map(row => m2[0].map((_, j) => row.reduce((acc, _, k) => acc + row[k] * m2[k][j], 0)));
        const string_to_column_matrix = str => str.split('').map((_, i) => [str[i].charCodeAt()]);
        const string_to_square_matrix = str => {
            const matrix_size = Math.ceil(Math.sqrt(str.length));
            return [...Array(matrix_size)].map((_, i) => [...Array(matrix_size)].map((_, j) =>  str[(i*matrix_size + j) % str.length].charCodeAt()));
        }
    
        secret_keys.forEach(sK => {
            const sK_matrix = string_to_square_matrix(sK);
            const tmp = pwd + pwd.slice(0, sK_matrix.length-pwd.length % sK_matrix.length);
            pwd = [...Array(tmp.length/sK_matrix.length)].map((_, i) =>
                column_matrix_to_string(
                    product(sK_matrix, string_to_column_matrix(tmp.slice(i*sK_matrix.length, (i+1)*sK_matrix.length)))
                )).join('').slice(0, pwd.length);
        });
    
        return pwd;
    }),
    'vigenere': new Encode_Method('Vigenère cipher', (pwd, secret_keys) => {
        secret_keys.forEach(sK => 
            pwd = pwd.split('').map((c, i) => String.fromCharCode(
                chars_code[(c.charCodeAt() + i + sK[i % sK.length].charCodeAt()) % chars_code.length]
            )).join('')
        );
        return pwd;
    }),
};

function create_password(website_name, account_identifier, secret_keys) {
    let pwd =  website_name + account_identifier;
    secret_keys.forEach(sK => pwd = pwd.split('').map((c, i) => c+sK[i % sK.length]).join(''));
    return pwd;
};
    
function generate_password(website_name, account_identifier, secret_keys, non_encoded_string='', only_letters_and_numbers=false, max_length, method) {
    if (only_letters_and_numbers) chars_code = [...range(48, 57), ...range(65, 90), ...range(97, 122)];
    function has_error() {
        const methods_available = Object.keys(encode_methods);

        let alert_msg = 'You need to put :\n';
        if (!website_name) alert_msg += '\t- the website name\n';
        if (!account_identifier) alert_msg += '\t- your account identifier\n';
        if (secret_keys < 1) alert_msg += '\t- at least a secret key\n';
        if (non_encoded_string.length > max_length && max_length > 0) alert_msg += '\t- a non-encoded string shorter that the max length\n';
        if (!methods_available.includes(method)) alert_msg += '\t- a method among '+methods_available.join(' | ');
        
        if (alert_msg.split('\n').length > 2) {
            alert(alert_msg);
            return true;
        } return false;
    };

    if (!has_error()) {
        let pwd = encode_methods[method].func(create_password(website_name, account_identifier, secret_keys), secret_keys) + non_encoded_string;
        if (pwd.length > max_length) pwd = pwd.slice(-max_length);

        return pwd;
    }
};