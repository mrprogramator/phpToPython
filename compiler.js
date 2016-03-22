fs = require('fs');

if (process.argv.length < 3) {
    console.log('file path missing :(');
    return;
}

var lexemes = [];

var reservedWords = [
'<?php','?>','and','or','xor','__FILE__','exception',
'__LINE__','array','as','break','case',
'class','const','continue','declare','default',
'die','do','echo','else','elseif',
'empty','enddeclare','endfor','endforeach','endif',
'endswitch','endwhile','eval','exit','extends',
'for','foreach','function','global','if',
'include','include_once','isset','list','new',
'print','require','require_once','return','static',
'switch','unset', 
 'use','var','while',
'__FUNCTION__','__CLASS__','__METHOD__','final','php_user_filter','interface',
'implements','extends','public','private',
'protected','abstract','clone','try','catch',
'throw','cfunction','old_function','this'
]

function isReservedWord(word){
    return (reservedWords.indexOf(word.replace(/\s/g,'')) >= 0)
}

function isLyric(c) {
    return ((c >='a' && c<='z') || (c >='A' && c<='Z'))
}

function isDigit(c) {
    return ((c >='0' && c<='9'))
}

function isOperator(c) {
    return ((c == '+' 
        || c == '-' 
        || c == '*' 
        || c == '/'
        || c == '%' 
        || c == '=' 
        || c == '||'
        || c == '&&'
        || c == '=='))
}

function isVariableName(word, index){
    if (index >= word.length){
        return true;
    }
    
    if (word[index] == "$"){
        if (index == 0){
            return isVariableName(word, ++index);
        }
        else{
            return false;
        }
    }
    
    if (isDigit(word[index])){
        if (index > 0){
            return isVariableName(word, ++index);
        }
        else {
            return false;
        }
    }
    
    if (isLyric(word[index]) || word[index] == '_') {
        return isVariableName(word, ++index);
    }
    
    if ((word[index] == "=" || word[index] == "\n" || word[index] == " ") 
        && index == word.length - 1 && index > 0 ) {
        return isVariableName(word, ++index);
    }
    if (word[index] == ""){
        return false;
    }
}

//php only accepts strings with " "
function isString (word) {
    return word[0] == "\"" && word[word.length - 1] == "\"" && word.length > 1;
}

function searchLexemes(instruction) {
    console.log('INSTRUCTION [', instruction, ']');
    var size = 1;
    var i = 0;
    
    while(i < instruction.length && size <= instruction.length) {
        var lexeme = instruction.substr(i, size);
        
        if (lexeme[0] == ' ' || lexeme[0] == '\n') {
            console.log('[SPACE | ENTER] found. Moving 1 space');
            ++i;
            size = 0;
        }
        
        if (isReservedWord(lexeme)) {
            lexemes.push({
                lexeme: lexeme,
                type: '[RESERVED WORD]'
            });
            console.log('[RESERVED WORD]', i,size, lexeme);
            i += size;
            size = 0;
        }
        
        else if (isString(lexeme)) {
            lexemes.push({
                lexeme: lexeme,
                type: '[STRING]'
            });
            console.log('[STRING]',i,size, lexeme);
            i += size;
            size = 0;
        }
        
        else if (isOperator(lexeme)) {
            lexemes.push({
                lexeme: lexeme,
                type: '[OPERATOR]'
            });
            console.log('[OPERATOR]',i,size, lexeme);
            i += size;
            size = 0;
        }
        
        else if(lexeme[lexeme.length - 1] == " "
                || lexeme[lexeme.length - 1] == "\n"
                || i + size == instruction.length) {
            if (isDigit(lexeme)) {
                lexemes.push({
                    lexeme: lexeme,
                    type: '[DIGIT]'
                });
                console.log('[DIGIT]',i,size, lexeme);
                i += size;
                size = 0;
            }
        }
        
        else if (lexeme[0] == "$" 
            && (lexeme[lexeme.length - 1] == "=" 
                || lexeme[lexeme.length - 1] == " "
                || lexeme[lexeme.length - 1] == "\n")
            ) {
            lexeme = lexeme.substr(0, lexeme.length -1);
            console.log("[=] found. Trying to check VAR NAME", lexeme);
            if (isVariableName(lexeme, 0)) {
                lexemes.push({
                    lexeme: lexeme,
                    type: '[VAR NAME]'
                });
                console.log('[VAR NAME]',i,size, lexeme);
                i += size - 1;
                size = 0;
            }
            else{
                console.log('NOT A VAR NAME :(', lexeme);
            }
        }
        
        else {
             ++size;
        }
        console.log('[CONTINUE]',i,size, lexeme);
    }
}


fs.readFile(process.argv[2],'utf-8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    console.log(data);
    
    data.split(";").forEach(function (instruction) {
        searchLexemes(instruction)
    });
    
    console.log(lexemes);
})
