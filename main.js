gmentdocument.addEventListener('DOMContentLoaded', () => {

  const segments = document.querySelector('.segments');
  const quantityN = document.querySelector('.quantity-n');
  const quantityK = document.querySelector('.quantity-k');
  const createBtn = document.querySelector('.create-btn');
  const copyBtn = document.querySelector('.copy-btn');
  const blocks = document.querySelector('.blocks');

  const demo =
  `
  segmentName1
  segmentName2
  segmentName3
  segmentName4
  segmentName5
  segmentName6
  segmentName7`;

  segments.textContent = demo;

  let segmentsList = extractSegments();
  quantityN.value = segmentsList.length;
  quantityK.value = 1;

  let fullCondition = '';

  function extractSegments() {
    const dirtyList = segments.value.split('\n');
    let segmentsList = [];

    for (let i = 0; i < dirtyList.length; i++) {
      if (dirtyList[i] != '') {
        segmentsList.push(dirtyList[i].trim());
      }
    }
    
    console.log(segmentsList)
    return segmentsList;
  }

  function generateLogicTable(n) {
    // generate list with empty strings
    let combos = [];
    for (let j = 0; j < Math.pow(2, n); j++) {
      combos.push("");
    }

    let ch = Math.pow(2, n - 1);
    let digit = "0";
    let count = 0;

    // generate combos
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < Math.pow(2, n); j++) {
        count++;
        combos[j] += digit;
        if (count === ch) {
          digit = digit === "0" ? "1" : "0";
          count = 0;
        }
      }
      ch /= 2;
    }

    return combos;
  }

  function calculateStringSum(string) {
    let sum = 0;
    for (let char of string) {
      sum += parseInt(char);
    }
    return sum;
  }

  function generateElementCombos(quantity, position) {
    let hauntedCombos = []
    generateLogicTable(quantity).forEach((el) => {
      if (calculateStringSum(el) < position) {
        hauntedCombos.push(el);
      }
    });
    return hauntedCombos
  }

  function renderBlocks(quantity, startText, endText) {
    const block = document.createElement('div');
    const start = document.createElement('div');
    const end = document.createElement('div');

    block.classList.add('block');
    block.textContent = `<!-- Block ${parseInt(quantity) + 1} -->`;

    start.textContent = startText;
    start.classList.add('start');
    block.prepend(start);

    end.textContent = endText;
    end.classList.add('end');
    block.append(end)

    blocks.append(block);
  }

  function generateDifficultCondition(list) {
    let conditions = [];
    for (let i = 0; i < list.length; i++) {
      let condition = '';
      for (let j = 0; j < list[i].length; j++) {
        condition += (list[i][j] === '1' ? `Recipient.IsInSegment("${segmentsList[j]}")` : `not(Recipient.IsInSegment("${segmentsList[j]}"))`)
        if (j < list[i].length - 1) {
          condition += ' and '
        }
      }
      conditions.push(condition);
    }

    let fullCondition = '';
    for (let i = 0; i < conditions.length; i++) {
      fullCondition += conditions[i];
      if (i < conditions.length - 1) {
        fullCondition += ' or '
      }
    }

    return fullCondition
  }

  segments.addEventListener('input', () => {
    segmentsList = extractSegments();
    quantityN.value = segmentsList.length;
  })

  createBtn.addEventListener('click', () => {
    // clear blocks
    while (blocks.firstChild) {
      blocks.removeChild(blocks.firstChild);
    }

    fullCondition = '';

    let n = quantityN.value;
    let k = quantityK.value;

    if (parseInt(k) === 1) {
      fullCondition += `@{if Recipient.IsInSegment("${segmentsList[0]}")}\n<!-- Block 1 -->\n`;
      renderBlocks(0, `@{if Recipient.IsInSegment("${segmentsList[0]}")}`);
      for (let i = 1; i < n - 1; i++) {
        fullCondition += `@{if else Recipient.IsInSegment("${segmentsList[i]}")}\n<!-- Block ${i + 1} -->\n`;
        renderBlocks(i, `@{if else Recipient.IsInSegment("${segmentsList[i]}")}`);
      }
      fullCondition += `@{else if Recipient.IsInSegment("${segmentsList[n - 1]}")}\n<!-- Block ${n} -->\n@{end if}`;
      renderBlocks(n - 1, `@{else if Recipient.IsInSegment("${segmentsList[n - 1]}")}`, `@{end if}`);
    } else if (parseInt(k) > 1 && parseInt(k) <= n) {
      for (let i = 0; i < k; i++) {
        fullCondition += `@{if Recipient.IsInSegment("${segmentsList[i]}")}\n<!-- Block ${i + 1} -->\n@{end if}\n`
        renderBlocks(i, `@{if Recipient.IsInSegment("${segmentsList[i]}")}`, `@{end if}`);
      }
      for (let i = parseInt(k); i < n; i++) {
        fullCondition += `@{if Recipient.IsInSegment("${segmentsList[i]}") and (${generateDifficultCondition(generateElementCombos(i, k))})}\n<!-- Block ${i + 1} -->\n@{end if}\n`
        renderBlocks(i, `@{if Recipient.IsInSegment("${segmentsList[i]}") and (${generateDifficultCondition(generateElementCombos(i, k))})}`, `@{end if}`);
      }
    }
  })

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(fullCondition);
    let remember = copyBtn.textContent;
    copyBtn.textContent = 'Готово!';
    const timeout = setTimeout(() => {
      copyBtn.textContent = remember;
    }, 1000);
  })
})
