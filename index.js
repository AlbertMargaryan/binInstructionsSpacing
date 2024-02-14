document.querySelector(".initial").addEventListener("click", function(event) {
  event.target.select();
});

document.querySelector(".initial").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    convertToRight()
  }
});


document.querySelector(".submit").addEventListener("click", (e) => {
  convertToRight()
})

function getAndNormalize() {
  return document.querySelector(".initial").value.replace(/\s/g, "");
}

function convertToRight() {
  let init = getAndNormalize();
  if (init.length < 32) {
    document.querySelector('.corrected').innerHTML = "Failed to convert. Less Than 32 Symbols"
    return false;
  }
  else if (init.length == 32) {
    let result = converter(init);

    navigator.clipboard.writeText(result);
    document.querySelector('.copy').style.display = 'block';
    document.querySelector('.corrected').innerHTML = result;
    console.log(result.replace(/\s/g, "").length == 32 && init == result.replace(/\s/g, ""))
  }
  else {
    let array = [];
    let result = [];
    if (init.length % 32 !== 0) {
      document.querySelector('.corrected').innerHTML = "Failed to convert. Length cannot be divided by 32"
      return false;
    }
    for (let i = 0; i < init.length; i += 32) {
        array.push(init.slice(i, i + 32));
    }
    
    array.forEach((e) => {
      result.push(converter(e));
    })

    let final = "";
    result.forEach((element) => {
        final += `<p>${element}</p>`;
    });

    document.querySelector('.corrected').innerHTML = final;
  }
}
//1100 0010 0000 0000 0010 1111 1010 0000
//11 00001 000000 00000 1 0111110100000

function converter(init) {
  const op = init.substring(0, 2)
  const rd = init.substring(2, 7)
  const cond = init.substring(3, 7)
  const op2 = init.substring(7, 10)
  const op3 = init.substring(7, 13)
  const rs1 = init.substring(13, 18)
  const i = init.charAt(18)
  const simm13 = init.substring(19, 33)
  const dispimm = init.substring(10, 33)
  const rs2 = init.substring(27, 33)
  const disp30 = init.substring(2,33)
  let result;

  const space = " ";

  if (op == '00') {
    if (op2 == '010'){
      result = op + space + rd + space + op2 + space + dispimm; 
    }
    else if (op2 == '100'){
      result = op + "0" + space + cond + op2 + space + dispimm;
    }
  }
  else if(op == '01') {
    result = op + space + disp30
  }
  else if ((op == '10' || op == '11') && i == 0) {
    result = op + space + rd + space + op3 + space + rs1 + space + i + space + "00000000" + space + rs2;
  }
  else if ((op == '10' || op == '11') && i == 1) {
    result = op + space + rd + space + op3 + space + rs1 + space + i + space + simm13;
  }
  return result;
}