const getCellValue = (cellRef, data) => {
  const colIndex = cellRef.match(/[A-Z]+/)[0];
  const rowIndex = parseInt(cellRef.match(/\d+/)[0]) - 1;
  const col = colIndex.split('').reduce((acc, char) => {
    return acc * 26 + char.charCodeAt(0) - 'A'.charCodeAt(0);
  }, 0);
  
  if (rowIndex < 0 || rowIndex >= data.length || col < 0 || col >= data[0].length) {
    throw new Error(`Invalid cell reference: ${cellRef}`);
  }
  
  const value = data[rowIndex][col];
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (!isNaN(value)) return parseFloat(value);
  return 0;
};

const evaluateExpression = (expression, data) => {
  // Replace cell references with their values
  const evalReady = expression.replace(/[A-Z]+\d+/g, (match) => {
    return getCellValue(match, data);
  });
  
  try {
    // Use Function instead of eval for better security
    return new Function(`return ${evalReady}`)();
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return '#ERROR!';
  }
};

export const evaluateFormula = (formula, data) => {
  if (!formula.startsWith('=')) return formula;
  
  const expression = formula.substring(1).trim();
  
  // Handle basic functions
  if (expression.startsWith('SUM(')) {
    const range = expression.match(/SUM\((.*)\)/)[1];
    const [start, end] = range.split(':');
    let sum = 0;
    
    const startCol = start.match(/[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0]);
    const endCol = end.match(/[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0]);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        sum += getCellValue(`${col}${row}`, data);
      }
    }
    
    return sum;
  }
  
  // Handle AVERAGE function
  if (expression.startsWith('AVERAGE(')) {
    const range = expression.match(/AVERAGE\((.*)\)/)[1];
    const [start, end] = range.split(':');
    let sum = 0;
    let count = 0;
    
    const startCol = start.match(/[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0]);
    const endCol = end.match(/[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0]);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        sum += getCellValue(`${col}${row}`, data);
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }
  
  // Handle basic arithmetic expressions
  return evaluateExpression(expression, data);
};
