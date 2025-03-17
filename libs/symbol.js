// Symbol polyfill
if (!window.Symbol) {
  window.Symbol = function(name) {
    return '__' + name;
  };
  
  window.Symbol.iterator = window.Symbol('Symbol.iterator');
} 