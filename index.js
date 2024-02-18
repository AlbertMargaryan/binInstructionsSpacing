document.querySelector(".initial").addEventListener("click", function(event) {
  if (document.querySelector('.select').checked) {
      event.target.select();
    }
});

document.querySelector(".initial").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    convertToRight()
  }
});


document.querySelector(".submit").addEventListener("click", (e) => {
  convertToRight()
})

document.querySelectorAll('input[name="type_instruction"]').forEach((e) => {
  e.addEventListener('click', (ev) => {
    if (ev.target.id === 'instruction') {
      document.querySelector('.initial').style.display = 'none';
      document.querySelector('.instructions').style.display = 'inline';
    }
    else {
      document.querySelector('.initial').style.display = 'inline';
      document.querySelector('.instructions').style.display = 'none';
    }
  })
})

function getAndNormalize() {
  let instruction = document.querySelector(".initial").value.replace(/\s/g, "");

  return instruction;
}

function convertToRight() {
  let init = getAndNormalize();
  let selectedRadio = document.querySelector('input[name="type_instruction"]:checked');

  if (selectedRadio.id === 'instruction') {
    convertInstruction();
    return 0;
  }

  if (selectedRadio.id === 'hex' && init.length == 8) {
    init = parseInt(init, 16).toString(2).padStart(32, '0');
  }

  if (init.length < 32 && !(selectedRadio.id === 'hex' && init.length !== 8)) {
    document.querySelector('.corrected').innerHTML = "Failed to convert. Less Than 32 Symbols"
    return false;
  }
  else if (init.length == 32 && !(selectedRadio.id != 'hex')) {
    let conversionResult = converter(init);
    let result = conversionResult[0];
    let instruction = conversionResult[1];

    navigator.clipboard.writeText(result);
    document.querySelector('.copy').style.display = 'block';
    document.querySelector('.corrected').innerHTML = result + '<p>' + instruction + '</p>';
  }
  else {
    let array = [];
    let result = [];
    let h = selectedRadio.id === 'hex' ? 8 : 32;
    console.log(init)
    if (init.length % h !== 0) {
      document.querySelector('.corrected').innerHTML = "Failed to convert. Length cannot be divided by 32"
      return false;
    }
    for (let i = 0; i < init.length; i += h) {
        array.push(init.slice(i, i + h));
    }
    
    array.forEach((e) => {
      if (selectedRadio.id === 'hex') {
        console.log(parseInt(e, 16).toString(2).padStart(32, '0'))
        result.push(converter(parseInt(e, 16).toString(2).padStart(32, '0')));
      } else if (selectedRadio.id === 'binary') {
        result.push(converter(e));
      }
      
    })

    let finalBinary = "";
    let finalInstructions = "";
    result.forEach((element) => {
        finalBinary += `<p>${element[0]}</p>`;
        finalInstructions += `<p>${element[1]}</p>`;
    });

    document.querySelector('.corrected').innerHTML = finalBinary + '<br>' + finalInstructions;
  }
}

function convertInstruction() {
  const textarea = document.querySelector('.instructions');
  const lines = textarea.value.split('\n');
  let linesArray = lines.map(line => line.split(' '));

    // Filter out elements starting with "."
  linesArray = linesArray.filter(arr => !arr[0].startsWith("."));

  // Filter out elements of the form ["name:", "number/hex"]
  linesArray = linesArray.filter(arr => !arr[1] || isNaN(parseInt(arr[1]) && arr[0].charAt(-1) === ':'));
  
  linesArray.forEach(arr => {
    if (arr[0].includes(":")) {
        arr.shift(); // Remove the first element
    }
  });

  const op2_inst = {
    'branch': '010',
    'sethi': '100'
  };

  const op3_inst = {
    'addcc': '010000',
    'andcc': '010001',
    'orcc': '010010',
    'orncc': '010110',
    'srl': '100110',
    'jmpl': '111000',
    'subcc': '010100',
  };

  const op3_memo = {
    'ld': '000000',
    'st': '000100'
  }

  const br_inst = {
    'be': '0001',
    'bcs': '0101',
    'bneg': '0110',
    'bvs': '0111',
    'ba': '1000',
  };
  console.log(linesArray)
  let arrayOfResults = [];
  linesArray.forEach((e) => {
    let result = ''
    if (op3_inst[e[0]]) {
      if (e[0] === 'jmpl') {
        if (e[1] === '%r15+4,' && e[2] === '%r0') {
          result = '10000001110000111110000000000100'
          arrayOfResults.push(result);
        }
      }
      else {
        let op1 = '10'
        let rd = parseInt(e[3].substring(2)).toString(2).padStart(5, '0');
        let op3 = op3_inst[e[0]];
        let rs1 = parseInt(e[1].substring(2)).toString(2).padStart(5, '0');
        let rs2simm = e[2].includes('%') ? parseInt(e[2].substring(2)).toString(2).padStart(14, '0') : '1' + parseInt(e[2].substring(1, e[2].length - 1)).toString(2).padStart(parseInt(13, 2), '0');
        result = op1+rd+op3+rs1+rs2simm;
        arrayOfResults.push(result)
      }
    }
    else if (op3_memo[e[0]]){
      let op1 = '11'
      let op3 = op3_memo[e[0]];
      let rs1 = '00000'
      let rd;
      let rs2simm;
      if (e[0] === 'ld') {
        rd = parseInt(e[2].substring(2)).toString(2).padStart(5, '0');
        rs2simm = e[1].includes('%') ? parseInt(e[1].substring(2)).toString(2).padStart(14, '0') : '1' + parseInt(e[1].substring(1, e[1].length - 1)).toString(2).padStart(13, '0');
      }
      else if(e[0] === 'st') {
        rd = parseInt(e[1].substring(2)).toString(2).padStart(5, '0');
        rs2simm = e[2].includes('%') ? parseInt(e[2].substring(2)).toString(2).padStart(14, '0') : '1' + parseInt(e[2].substring(1, e[2].length - 1)).toString(2).padStart(13, '0');
      }
      result = op1+rd+op3+rs1+rs2simm;
      arrayOfResults.push(result)
    }
    else if(br_inst[e[0]] || e[0] === 'sethi') {
      let op1 = '00';
      if (e[0] === 'sethi') {
        let op2 = '100'
        let rd;
        arrayOfResults.push('N/A')
      }
      else {
        let cond = '0' + br_inst[e[0]];
        let op2 = '010';
        let disp22 = parseInt(e[1].substring(1, e[1].length - 1)).toString(2).padStart(22, '0');
        let result = op1 + cond + op2 + disp22;
        arrayOfResults.push(result)
      }
    }
    else {
      arrayOfResults.push('N/A')
      console.log('We doesnt support this function')
    }
  })
  let finalBinary = "";
  for (let i = 0; i < arrayOfResults.length; i++){
    finalBinary += `<p>${linesArray[i].join(" ")}: ${arrayOfResults[i]}</p>`;
  }
    arrayOfResults.forEach((element) => {
        
    });
  document.querySelector('.corrected').innerHTML = finalBinary;
}

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

  const rd_i = "%r" + parseInt(rd, 2);
  const rs1_i = "%r" + parseInt(rs1, 2);
  const rs2_i = "%r" + parseInt(rs2, 2);
  const dispimm_i = complement2decimal(dispimm);
  const simm13_i = complement2decimal(simm13);
  const disp30_i = complement2decimal(disp30);
  let result;
  let instruction;

  const op2_inst = {
    '010': 'branch',
    '100': 'sethi'
  } 

  const op3_inst = {
    '010000': 'addcc',
    '010001': 'andcc',
    '010010': 'orcc',
    '010110': 'orncc',
    '100110': 'srl',
    '111000': 'jmpl',
    '010100': 'subcc',
    '000000': 'ld',
    '000100': 'st',
  }

  const br_inst = {
    '0001': 'be',
    '0101': 'bcs',
    '0110': 'bneg',
    '0111': 'bvs',
    '1000': 'ba',
  }

  const space = " ";
  const tab = "    ";
  const comma = ", "

  if (op == '00') {
    if (op2 == '100'){
      result = op + space + rd + space + op2 + space + dispimm; 
      instruction = 'sethi' + tab + dispimm_i + ', ' + rd_i;
    }
    else if (op2 == '010'){
      result = op + " 0" + space + cond + op2 + space + dispimm;
      instruction = br_inst[cond] + tab + dispimm_i;
    }
  }
  else if(op == '01') {
    result = op + space + disp30;
    instruction = 'call' + tab + disp30;
  }
  else if ((op == '10' || op == '11') && i == 0) {
    result = op + space + rd + space + op3 + space + rs1 + space + i + space + "00000000" + space + rs2;
    instruction = op3_inst[op3] + tab + rs1_i + comma + rs2_i + comma + rd_i;
    if (op3_inst[op3] == 'st') {
      instruction = op3_inst[op3] + tab + rd_i + comma + rs2_i;
    }
    else if (op3_inst[op3] == 'ld') {
      instruction = op3_inst[op3] + tab + rs2_i + comma + rd_i;
    }
  }
  else if ((op == '10' || op == '11') && i == 1) {
    result = op + space + rd + space + op3 + space + rs1 + space + i + space + simm13;
    if (op == '10') {
      instruction = op3_inst[op3] + tab + rs1_i + comma + simm13_i + comma + rd_i;
    } else if (op == '11') {
      instruction = op3_inst[op3] + tab + rs1_i + comma + '[' + simm13_i + ']' + comma + rd_i;
    }
    if (op3_inst[op3] == 'st') {
      instruction = op3_inst[op3] + tab + rd_i + comma + '[' + simm13_i + ']';
    } else if (op3_inst[op3] == 'ld') {
      instruction = op3_inst[op3] + space + '[' + simm13_i + ']' + comma + rd_i;
    }
  }
  return [result, instruction];
}

function complement2decimal (number) {
      if (number.charAt(0) === '1') {
        let twosComplement = number.split('').map(bit => bit === '1' ? '0' : '1').join('');
        let decimal = parseInt(twosComplement, 2) + 1;
        return -decimal;
    } else {
        return parseInt(number, 2);
    }
}