import React, { useMemo } from 'react';

/**
 * Converts markdown text to HTML with enhanced formatting options
 * @param {string} text - The markdown text to convert
 * @returns {string} - The converted HTML
 */
function markdownToHtml(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let listContext = []; // Track list context with more metadata
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let inQuoteBlock = false;
  let inTableBlock = false;
  let tableRows = [];
  let tableHeaders = [];

  // First pass - basic text cleanup that was previously done in backend
  text = text
    .replace(/\s*\n\s*/g, '\n')      // Trim whitespace around newlines
    .replace(/\n{3,}/g, '\n\n');      // Collapse 3+ newlines to 2

  /**
   * Returns the appropriate CSS class names for a list based on its type and nesting level.
   * @param {string} type - The type of the list ('ol' for ordered list or 'ul' for unordered list)
   * @param {number} nestLevel - The nesting level of the list
   * @returns {string} - CSS class names to style the list
   */
  const getListClasses = (type, nestLevel) => {
    // For list styling, we need to ensure we get both proper spacing and proper list styling
    // Use list-outside instead of list-inside to ensure proper text wrapping and indentation
    const baseClasses = 'space-y-1 list-outside'; 
    
    if (type === 'ol') {
      return `${baseClasses} list-decimal pl-${Math.min(nestLevel * 2 + 4, 8)}`;
    } else {
      return `${baseClasses} list-disc pl-${Math.min(nestLevel * 2 + 4, 8)}`;
    }
  };

  // Process inline formatting for text content
  const processInlineFormatting = (text) => {
    return text
      // Bold - both ** and __ syntax
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic - both * and _ syntax
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<span class="line-through">$1</span>')
      // Highlight text with ==
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 text-gray-800 px-1 rounded">$1</mark>')
      // Subscript with ~
      .replace(/~([^~]+)~/g, '<sub>$1</sub>')
      // Superscript with ^
      .replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
      // Keyboard keys with [[key]]
      .replace(/\[\[([^\]]+)\]\]/g, '<kbd class="px-1.5 py-0.5 text-xs font-semibold bg-gray-700 text-white rounded border border-gray-600 shadow-sm">$1</kbd>');
  };

  // Handle emoji and special formatting markers
  const formatSpecialMarkers = (line) => {
    return line
      // Section markers with emoji
      .replace(/^🗣️ (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="font-bold text-lg my-2 text-gray-200"><span class="mr-2">🗣️</span>$1</p>')
      .replace(/^💡 (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-yellow-300">💡 Tip: </span>$1</p>')
      .replace(/^🔍 (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-blue-300">🔍 Analysis: </span>$1</p>')
      .replace(/^💬 (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-green-300">💬 Note: </span>$1</p>')
      .replace(/^⚠️ (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-red-300">⚠️ Warning: </span>$1</p>')
      .replace(/^🔑 (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-purple-300">🔑 Key Point: </span>$1</p>')
      // New section markers
      .replace(/^📋 (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-blue-200">📋 Summary: </span>$1</p>')
      .replace(/^🔧 (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-orange-300">🔧 How-to: </span>$1</p>')
      .replace(/^⭐ (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-yellow-200">⭐ Highlight: </span>$1</p>')
      .replace(/^❓ (.+)/, '<hr class="my-3 border-t border-gray-300"/><p class="my-2 text-gray-200"><span class="font-bold text-red-200">❓ Question: </span>$1</p>')
      // Dividers
      .replace(/^---$/, '<hr class="my-4 border-t border-gray-300"/>')
      .replace(/^\*\*\*$/, '<hr class="my-4 border-t-2 border-gray-400"/>')
      .replace(/^====$/, '<hr class="my-4 border-t-2 border-dashed border-gray-300"/>')
      // Checkboxes with improved styling
      .replace(/^\[x\] (.+)/, '<div class="flex items-start mt-2"><div class="bg-green-500 text-white rounded-sm w-5 h-5 flex items-center justify-center mr-2 mt-0.5 shadow-sm">✓</div><div class="flex-1">$1</div></div>')
      .replace(/^\[ \] (.+)/, '<div class="flex items-start mt-2"><div class="border border-gray-400 rounded-sm w-5 h-5 mr-2 mt-0.5 shadow-inner"></div><div class="flex-1">$1</div></div>')
      // Partial checkboxes
      .replace(/^\[~\] (.+)/, '<div class="flex items-start mt-2"><div class="bg-yellow-500 text-white rounded-sm w-5 h-5 flex items-center justify-center mr-2 mt-0.5 shadow-sm">⟨</div><div class="flex-1">$1</div></div>');
  };

  const processHeading = (line) => {
    const h1Match = line.match(/^# (.+)/);
    if (h1Match) return `<h1 class="text-2xl font-bold mt-6 mb-4 pb-1 border-b border-gray-700">${processInlineFormatting(h1Match[1])}</h1>`;
    
    const h2Match = line.match(/^## (.+)/);
    if (h2Match) return `<h2 class="text-xl font-bold mt-5 mb-3 pb-1 border-b border-gray-800">${processInlineFormatting(h2Match[1])}</h2>`;
    
    const h3Match = line.match(/^### (.+)/);
    if (h3Match) return `<h3 class="text-lg font-bold mt-4 mb-2">${processInlineFormatting(h3Match[1])}</h3>`;
    
    const h4Match = line.match(/^#### (.+)/);
    if (h4Match) return `<h4 class="text-base font-bold mt-3 mb-2 text-gray-300">${processInlineFormatting(h4Match[1])}</h4>`;
    
    const h5Match = line.match(/^##### (.+)/);
    if (h5Match) return `<h5 class="text-sm font-bold mt-3 mb-1 text-gray-400">${processInlineFormatting(h5Match[1])}</h5>`;
    
    return null;
  };

  // Enhanced table support
  const processTable = (line) => {
    // Check if we're in a table or starting a new one
    if (line.trim().match(/^\|.*\|$/)) {
      const cells = line.trim().split('|').slice(1, -1);
      
      // Headers separator row
      if (line.trim().match(/^\|\s*[-:]+[-|\s:]*\|$/)) {
        // Process headers alignment
        const alignments = cells.map(cell => {
          if (cell.trim().startsWith(':') && cell.trim().endsWith(':')) return 'text-center';
          if (cell.trim().endsWith(':')) return 'text-right';
          return 'text-left';
        });
        
        if (!inTableBlock) {
          inTableBlock = true;
          tableHeaders = []; // Reset in case we somehow missed a closing condition
        }
        
        // Store alignments in the headers
        tableHeaders = tableHeaders.map((header, i) => ({
          content: header,
          align: alignments[i] || 'text-left'
        }));
        
        return true;
      }
      
      // If we're not in a table yet, this must be the header row
      if (!inTableBlock) {
        inTableBlock = true;
        tableHeaders = cells.map(cell => cell.trim());
        return true;
      }
      
      // Data row
      tableRows.push(cells.map(cell => cell.trim()));
      return true;
    }
    
    // If we're in a table but the current line doesn't match the table pattern,
    // that means we're done with the table
    if (inTableBlock) {
      let tableHtml = '<div class="overflow-auto my-4">';
      tableHtml += '<table class="min-w-full bg-gray-800 border border-gray-700 rounded-md">';
      
      // Table headers
      if (tableHeaders.length > 0) {
        tableHtml += '<thead class="bg-gray-700">';
        tableHtml += '<tr>';
        
        tableHeaders.forEach((header, i) => {
          const headerObj = typeof header === 'object' ? header : { content: header, align: 'text-left' };
          tableHtml += `<th class="px-4 py-2 ${headerObj.align}">${processInlineFormatting(headerObj.content)}</th>`;
        });
        
        tableHtml += '</tr>';
        tableHtml += '</thead>';
      }
      
      // Table body
      if (tableRows.length > 0) {
        tableHtml += '<tbody>';
        
        tableRows.forEach((row, rowIndex) => {
          tableHtml += `<tr class="${rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} border-t border-gray-700">`;
          
          row.forEach((cell, cellIndex) => {
            const align = tableHeaders[cellIndex] && typeof tableHeaders[cellIndex] === 'object' ? 
              tableHeaders[cellIndex].align : 'text-left';
            
            tableHtml += `<td class="px-4 py-2 ${align}">${processInlineFormatting(cell)}</td>`;
          });
          
          tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody>';
      }
      
      tableHtml += '</table>';
      tableHtml += '</div>';
      
      html += tableHtml;
      
      // Reset table state
      inTableBlock = false;
      tableRows = [];
      tableHeaders = [];
      
      return false; // Process the current line as a non-table element
    }
    
    return false;
  };

  // Enhanced list context management with standardization and proper nested list support
  const processLists = (line, indentLevel) => {
    // First standardize list markers (moved from backend)
    line = line
      .replace(/^(\s*)(?:[-•])\s+/gm, '$1• ')   // Standardize bullets to '• '
      .replace(/^(\s*)(\d+\.)\s+/gm, '$1$2 ');   // Standardize numbered lists spacing
    
    const olMatch = line.match(/^(\s*)(\d+)\.(?!\d)\s+(.*)/);
    const ulMatch = line.match(/^(\s*)[•]\s+(.*)/);
    
    if (!olMatch && !ulMatch) return null;
    
    const type = olMatch ? 'ol' : 'ul';
    const leadingSpaces = olMatch ? olMatch[1].length : ulMatch[1].length;
    const content = olMatch ? olMatch[3] : ulMatch[2];
    const listNumber = olMatch ? parseInt(olMatch[2], 10) : null;
    
    // Use the actual leading spaces to determine nesting level
    // This ensures proper indentation for nested lists
    const nestLevel = Math.floor(leadingSpaces / 2);
    
    // Close lists that are at a deeper level than the current line
    while (listContext.length > 0 && leadingSpaces < listContext[listContext.length - 1].indent) {
      const closedList = listContext.pop();
      html += `</${closedList.type}>\n`;
    }
    
    // If we're at the same indentation level but the list type has changed
    // (e.g., from numbered to bullet points), close the current list and start a new one
    if (listContext.length > 0 && 
        leadingSpaces === listContext[listContext.length - 1].indent && 
        type !== listContext[listContext.length - 1].type) {
      const currentList = listContext.pop();
      html += `</${currentList.type}>\n`;
      
      html += `<${type} class="${getListClasses(type, nestLevel)}"${type === 'ol' && listNumber !== 1 ? ` start="${listNumber}"` : ''}>\n`;
      listContext.push({ type, indent: leadingSpaces, lastNumber: listNumber });
    } 
    // If we're at a deeper level than the previous list, start a new nested list
    else if (listContext.length === 0 || leadingSpaces > listContext[listContext.length - 1].indent) {
      html += `<${type} class="${getListClasses(type, nestLevel)}"${type === 'ol' && listNumber !== 1 ? ` start="${listNumber}"` : ''}>\n`;
      listContext.push({ type, indent: leadingSpaces, lastNumber: listNumber });
    }
    // If it's the same type of list at the same level, just continue the current list
    else if (listContext.length > 0 && 
             leadingSpaces === listContext[listContext.length - 1].indent && 
             type === listContext[listContext.length - 1].type) {
      // For ordered lists, handle non-sequential numbering
      if (type === 'ol' && 
          listNumber !== listContext[listContext.length - 1].lastNumber + 1 && 
          listNumber !== 1) {
        html += `<li value="${listNumber}" class="ml-5">${processInlineFormatting(content)}</li>\n`;
        listContext[listContext.length - 1].lastNumber = listNumber;
        return true;
      }
    }
    
    // Add proper list item with increased indentation for better readability
    // Calculate indent class based on nesting level for better visual hierarchy
    const indentClass = nestLevel > 0 ? `ml-${Math.min(nestLevel * 2 + 5, 8)}` : "ml-5";
    
    html += `<li class="${indentClass}">${processInlineFormatting(content)}</li>\n`;
    if (type === 'ol') {
      listContext[listContext.length - 1].lastNumber = listNumber;
    }
    
    return true;
  };

  // Process definition lists
  const processDefinitionList = (line, lines, currentIndex) => {
    // Check if this is a potential definition term (we need to look ahead to confirm)
    const termMatch = line.match(/^([^:]+):$/);
    if (!termMatch) return false;
    
    // Look ahead to see if the next line is indented (definition description)
    const nextLine = lines[currentIndex + 1];
    if (!nextLine || !nextLine.match(/^\s+/)) return false;
    
    // We have a definition list item
    const term = termMatch[1].trim();
    let description = '';
    let descriptionLines = [];
    
    // Collect all indented lines for the description
    let i = currentIndex + 1;
    while (i < lines.length && lines[i].match(/^\s+/)) {
      descriptionLines.push(lines[i].trim());
      i++;
    }
    
    description = descriptionLines.join(' ');
    
    // Add the definition list item
    html += `<div class="mb-3">`;
    html += `<dt class="font-bold text-gray-300">${processInlineFormatting(term)}</dt>`;
    html += `<dd class="ml-6 mt-1 text-gray-400">${processInlineFormatting(description)}</dd>`;
    html += `</div>`;
    
    // Skip the lines we just processed
    return i - currentIndex;
  };

  // Main processing loop
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().substring(3).trim() || 'plaintext';
        codeContent = '';
        continue;
      } else {
        inCodeBlock = false;
        html += `<pre class="bg-gray-800 p-4 rounded-md my-4 overflow-x-auto border border-gray-700"><code class="language-${codeLanguage} font-mono text-sm">${codeContent}</code></pre>`;
        continue;
      }
    }
    
    if (inCodeBlock) {
      codeContent += line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
      continue;
    }
    
    // Handle blockquotes with enhanced styling
    if (line.trim().startsWith('>')) {
      const quoteContent = line.trim().substring(1).trim();
      if (!inQuoteBlock) {
        inQuoteBlock = true;
        html += '<blockquote class="pl-4 border-l-4 border-blue-500 bg-gray-800 p-3 rounded-r-md my-4">';
      }
      html += `<p class="text-gray-300">${processInlineFormatting(quoteContent)}</p>`;
      continue;
    } else if (inQuoteBlock) {
      inQuoteBlock = false;
      html += '</blockquote>';
    }
    
    // Process tables
    if (processTable(line)) continue;
    
    // Process definition lists
    const definitionListAdvance = processDefinitionList(line, lines, i);
    if (definitionListAdvance) {
      i += definitionListAdvance - 1; // -1 because the loop will increment i
      continue;
    }
    
    // Empty line handling - close lists if needed based on context
    if (line.trim() === '') {
      // Only close lists if we're transitioning to a non-list element
      if (i < lines.length - 1 && lines[i+1].trim() !== '' && 
          !lines[i+1].trim().match(/^(\s*)[-*+•]\s+/) && 
          !lines[i+1].trim().match(/^(\s*)\d+\.\s+/)) {
        // Close all lists if next line isn't a list item
        while (listContext.length > 0) {
          const closedList = listContext.pop();
          html += `</${closedList.type}>\n`;
        }
      }
      
      // Add spacing between paragraphs
      if (i < lines.length - 1 && lines[i+1].trim() !== '' && html.length > 0) {
        html += '<br/>\n';
      }
      continue;
    }
    
    // Process headings
    const headingHtml = processHeading(line.trim());
    if (headingHtml) {
      // Close lists before adding a heading
      while (listContext.length > 0) {
        const closedList = listContext.pop();
        html += `</${closedList.type}>\n`;
      }
      html += headingHtml;
      continue;
    }
    
    // Process special markers with enhanced styling
    const formattedLine = formatSpecialMarkers(line.trim());
    if (formattedLine !== line.trim()) {
      // Close lists before adding special content
      while (listContext.length > 0) {
        const closedList = listContext.pop();
        html += `</${closedList.type}>\n`;
      }
      html += formattedLine;
      continue;
    }
    
    // Process lists - if successful, continue to next line
    if (processLists(line, line.match(/^(\s*)/)[0].length)) continue;
    
    // Regular paragraph content
    // Close lists if this isn't part of a list
    while (listContext.length > 0) {
      const closedList = listContext.pop();
      html += `</${closedList.type}>\n`;
    }
    
    html += `<p class="my-2 text-gray-200">${processInlineFormatting(line.trim())}</p>\n`;
  }

  // Close any remaining open elements
  if (inQuoteBlock) {
    html += '</blockquote>\n';
  }
  
  if (inTableBlock) {
    processTable(''); // This will close the table properly
  }
  
  while (listContext.length > 0) {
    const closedList = listContext.pop();
    html += `</${closedList.type}>\n`;
  }

  return html;
}

/**
 * Detect emotion patterns in text with expanded capabilities
 */
const detectMood = (text) => {
  if (!text) return null;

  const confusionPatterns = [
    /i(?:'m)?\s+(?:still\s+)?confused/i,
    /i\s+don'?t\s+(?:really\s+)?(?:get|understand)/i,
    /what\s+do\s+you\s+mean/i,
    /(?:can|could)\s+you\s+(?:please\s+)?(?:explain|clarify)/i,
    /(?:this|that)\s+(?:doesn'?t|does\snot)\s+make\s+sense/i,
    /how\s+does\s+that\s+work/i,
    /(?:I'm|I am)\s+lost/i
  ];

  const frustrationPatterns = [
    /(?:this|that|it)(?:'s|\s+is)\s+(?:really\s+)?(?:hard|difficult|complicated)/i,
    /i(?:'m)?\s+(?:getting\s+)?frustrated/i,
    /i(?:'m)?\s+(?:really\s+)?stuck/i,
    /i(?:'ve)?\s+tried\s+(?:everything|many\s+times)/i,
    /not\s+(?:working|helping)/i,
    /(?:too|so)\s+(?:complicated|complex)/i,
    /this\s+is\s+(?:ridiculous|absurd)/i
  ];
  
  const excitementPatterns = [
    /(?:this|that|it)(?:'s|\s+is)\s+(?:really\s+)?(?:amazing|awesome|great)/i,
    /(?:wow|cool|awesome|fantastic|excellent)/i,
    /(?:I|that)(?:'s|\s+is)\s+(?:really\s+)?(?:excited|thrilled|impressed)/i,
    /(?:thank\s+you|thanks)\s+(?:so|very)\s+much/i,
    /(?:just|exactly)\s+what\s+I\s+needed/i
  ];

  const uncertaintyPatterns = [
    /(?:I'm|I am)\s+not\s+sure/i,
    /(?:maybe|perhaps|possibly)/i,
    /(?:should|could|would)\s+(?:I|we|this|that)/i,
    /(?:what|which)\s+(?:would|could|should)/i,
    /(?:I'm|I am)\s+(?:concerned|worried)/i
  ];

  const isConfused = confusionPatterns.some(pattern => pattern.test(text));
  const isFrustrated = frustrationPatterns.some(pattern => pattern.test(text));
  const isExcited = excitementPatterns.some(pattern => pattern.test(text));
  const isUncertain = uncertaintyPatterns.some(pattern => pattern.test(text));

  return {
    isConfused,
    isFrustrated,
    isExcited,
    isUncertain
  };
};

/**
 * Get sentiment emoji and color based on sentiment and mood
 */
const getSentimentDisplay = (sentiment, text) => {
  // Only apply mood detection to non-AI responses
  if (!sentiment?.isAiResponse) {
    const mood = detectMood(text);
    
    if (mood?.isExcited) {
      return {
        emoji: '😄',
        color: 'text-green-400',
        tooltip: 'User seems excited'
      };
    }
    if (mood?.isConfused) {
      return {
        emoji: '😕',
        color: 'text-yellow-400',
        tooltip: 'User seems confused'
      };
    }
    if (mood?.isFrustrated) {
      return {
        emoji: '😫',
        color: 'text-orange-400',
        tooltip: 'User seems frustrated'
      };
    }
    if (mood?.isUncertain) {
      return {
        emoji: '🤔',
        color: 'text-blue-400',
        tooltip: 'User seems uncertain'
      };
    }
  }

  if (!sentiment) {
    return {
      emoji: '😐',
      color: 'text-gray-400',
      tooltip: 'Neutral'
    };
  }

  if (sentiment.label === 'negative' || sentiment.score < -0.5) {
    return {
      emoji: '😟',
      color: 'text-red-400',
      tooltip: 'Negative sentiment detected'
    };
  }
  
  if (sentiment.label === 'positive' || sentiment.score > 0.5) {
    return {
      emoji: '😊',
      color: 'text-green-400',
      tooltip: 'Positive sentiment'
    };
  }

  return {
    emoji: '😐',
    color: 'text-gray-400',
    tooltip: 'Neutral'
  };
};

/**
 * Enhance code syntax highlighting with line numbers and improved styling
 */
const syntaxHighlightCode = () => {
  // This function would be called after rendering to enhance code blocks
  // Replace with actual implementation if you have a syntax highlighting library
  
  // Example implementation using an external library like Prism.js
  if (typeof window !== 'undefined' && window.Prism) {
    window.Prism.highlightAll();
  }
};

/**
 * React component that renders chat message content with enhanced markdown support
 * @param {Object} props - Component props
 * @param {string} props.text - The markdown text to render
 * @param {Object} props.sentiment - Sentiment analysis data
 * @param {Object} props.messageConfig - Optional configuration for message display
 * @returns {JSX.Element} - The rendered chat message content
 */
const EnhancedChatMessageContent = ({ text, sentiment, messageConfig = {} }) => {
  const { showSentiment = true, additionalClasses = '' } = messageConfig;
  
  // Process markdown to HTML
  const htmlContent = useMemo(() => markdownToHtml(text || 'No message content'), [text]);
  
  // Get sentiment display information
  const sentimentDisplay = useMemo(() => getSentimentDisplay(sentiment, text), [sentiment, text]);
  
  // Apply syntax highlighting after rendering
  React.useEffect(() => {
    syntaxHighlightCode();
  }, [htmlContent]);
  
  return (
    <div className={`relative ${additionalClasses}`}>
      {showSentiment && (
        <div 
          className={`absolute -left-7 top-0 ${sentimentDisplay.color} transition-all duration-300 hover:scale-125`}
          title={sentimentDisplay.tooltip}
        >
          {sentimentDisplay.emoji}
        </div>
      )}
      <div 
        className="text-sm break-words prose prose-sm max-w-none text-gray-200 prose-headings:text-gray-200 prose-strong:text-gray-100 prose-em:text-gray-300 prose-ol:pl-6 prose-ul:pl-6 prose-ol:list-decimal prose-ul:list-disc prose-li:pl-2 prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-blockquote:border-blue-500 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:bg-gray-800 prose-blockquote:rounded-r-md" 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
};

// Optional component for displaying markdown text with customizable themes
const ThemedMarkdownContent = ({ text, theme = 'dark', config = {} }) => {
  const { 
    showLineNumbers = false,
    enableCopy = true,
    animateChanges = true,
    compactMode = false
  } = config;
  
  // Theme configurations
  const themes = {
    dark: {
      baseClasses: 'text-gray-200 bg-gray-900',
      headingClasses: 'text-gray-100',
      codeClasses: 'bg-gray-800 border-gray-700',
      linkClasses: 'text-blue-400 hover:text-blue-300',
      blockquoteClasses: 'border-blue-500 bg-gray-800',
      tableClasses: 'border-gray-700 bg-gray-800'
    },
    light: {
      baseClasses: 'text-gray-800 bg-white',
      headingClasses: 'text-gray-900',
      codeClasses: 'bg-gray-100 border-gray-300',
      linkClasses: 'text-blue-600 hover:text-blue-500',
      blockquoteClasses: 'border-blue-400 bg-gray-100',
      tableClasses: 'border-gray-300 bg-white'
    },
    terminal: {
      baseClasses: 'text-green-300 bg-black',
      headingClasses: 'text-green-100',
      codeClasses: 'bg-gray-900 border-green-800',
      linkClasses: 'text-blue-300 hover:text-blue-200',
      blockquoteClasses: 'border-green-500 bg-gray-900',
      tableClasses: 'border-green-800 bg-black'
    },
    custom: config.customTheme || {} // Allow completely custom theming
  };
  
  const currentTheme = themes[theme] || themes.dark;
  
  // Generate HTML content with theme-specific classes
  const htmlContent = useMemo(() => {
    // We could extend markdownToHtml to accept theme parameters
    // For now, we'll use basic string replacement on the output
    let html = markdownToHtml(text || 'No content');
    
    // Apply theme-specific class replacements if needed
    // This is a simplified approach - a more robust solution would modify markdownToHtml
    
    return html;
  }, [text, theme]);
  
  // Additional classes based on configuration
  const containerClasses = [
    currentTheme.baseClasses,
    compactMode ? 'text-xs leading-snug' : 'text-sm leading-relaxed',
    animateChanges ? 'transition-all duration-300' : ''
  ].join(' ');
  
  React.useEffect(() => {
    // Apply syntax highlighting and any other post-processing
    syntaxHighlightCode();
    
    // Set up copy buttons if enabled
    if (enableCopy) {
      const codeBlocks = document.querySelectorAll('.themed-markdown pre');
      codeBlocks.forEach(block => {
        // Only add button if it doesn't already exist
        if (!block.querySelector('.copy-button')) {
          const button = document.createElement('button');
          button.className = 'copy-button absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded p-1 text-xs';
          button.innerHTML = 'Copy';
          button.addEventListener('click', () => {
            const code = block.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
              button.innerHTML = 'Copied!';
              setTimeout(() => { button.innerHTML = 'Copy'; }, 2000);
            });
          });
          block.style.position = 'relative';
          block.appendChild(button);
        }
      });
    }
    
    // Add line numbers if enabled
    if (showLineNumbers) {
      const codeBlocks = document.querySelectorAll('.themed-markdown pre code');
      codeBlocks.forEach(block => {
        const lines = block.innerHTML.split('\n');
        let numberedLines = '';
        
        lines.forEach((line, i) => {
          if (i < lines.length - 1 || line.trim() !== '') { // Skip empty trailing line
            numberedLines += `<div class="code-line"><span class="line-number">${i + 1}</span>${line}</div>`;
          }
        });
        
        block.innerHTML = numberedLines;
      });
    }
  }, [htmlContent, showLineNumbers, enableCopy]);
  
  return (
    <div className={`themed-markdown relative ${containerClasses}`}>
      <div 
        className={`prose max-w-none ${compactMode ? 'prose-sm' : 'prose-base'}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
};

/**
 * Highlighted Message Component with customizable styles
 */
const HighlightedMessage = ({ text, type = 'info', icon, title, dismissable = false }) => {
  const [dismissed, setDismissed] = React.useState(false);
  
  // Don't render if dismissed
  if (dismissed) return null;
  
  // Message type configurations
  const typeConfigs = {
    info: {
      bgColor: 'bg-blue-900 bg-opacity-20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-300',
      icon: icon || 'ℹ️',
      defaultTitle: 'Information'
    },
    success: {
      bgColor: 'bg-green-900 bg-opacity-20',
      borderColor: 'border-green-500',
      textColor: 'text-green-300',
      icon: icon || '✅',
      defaultTitle: 'Success'
    },
    warning: {
      bgColor: 'bg-yellow-900 bg-opacity-20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-300',
      icon: icon || '⚠️',
      defaultTitle: 'Warning'
    },
    error: {
      bgColor: 'bg-red-900 bg-opacity-20',
      borderColor: 'border-red-500',
      textColor: 'text-red-300',
      icon: icon || '❌',
      defaultTitle: 'Error'
    },
    tip: {
      bgColor: 'bg-purple-900 bg-opacity-20', 
      borderColor: 'border-purple-500',
      textColor: 'text-purple-300',
      icon: icon || '💡',
      defaultTitle: 'Tip'
    }
  };
  
  const config = typeConfigs[type] || typeConfigs.info;
  const displayTitle = title || config.defaultTitle;
  
  // Process the text through our markdown renderer
  const processedContent = markdownToHtml(text);
  
  return (
    <div className={`relative my-4 p-4 rounded-md border-l-4 ${config.borderColor} ${config.bgColor}`}>
      {/* Title bar with icon */}
      <div className="flex items-center mb-2">
        <span className="mr-2 text-xl">{config.icon}</span>
        <h4 className={`font-bold ${config.textColor}`}>{displayTitle}</h4>
        
        {dismissable && (
          <button 
            onClick={() => setDismissed(true)}
            className="ml-auto text-gray-400 hover:text-gray-200"
            aria-label="Dismiss message"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Content */}
      <div 
        className="pl-6 text-gray-200 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

/**
 * Message Actions component for common actions like copy, reply, etc.
 */
const MessageActions = ({ onCopy, onReply, onSave, onHighlight }) => {
  return (
    <div className="message-actions invisible group-hover:visible flex gap-2 mt-2 text-xs text-gray-500">
      <button 
        onClick={onCopy} 
        className="hover:text-blue-400 flex items-center gap-1"
        title="Copy message text"
      >
        <span>📋</span> Copy
      </button>
      
      <button 
        onClick={onReply} 
        className="hover:text-green-400 flex items-center gap-1"
        title="Reply to this message"
      >
        <span>↩️</span> Reply
      </button>
      
      <button 
        onClick={onSave} 
        className="hover:text-yellow-400 flex items-center gap-1"
        title="Save message"
      >
        <span>🔖</span> Save
      </button>
      
      <button 
        onClick={onHighlight} 
        className="hover:text-purple-400 flex items-center gap-1"
        title="Highlight message"
      >
        <span>🖍️</span> Highlight
      </button>
    </div>
  );
};

/**
 * Complete enhanced chat message component with all features
 */
const CompleteChatMessage = ({ 
  text, 
  sender, 
  timestamp, 
  sentiment, 
  isAi = false,
  avatar,
  config = {}
}) => {
  const { 
    showActions = true,
    showTimestamp = true,
    showSentiment = true,
    enableMarkdown = true
  } = config;
  
  // Format timestamp
  const formattedTime = useMemo(() => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }, [timestamp]);
  
  // Action handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    // Could show a toast notification here
  };
  
  const handleReply = () => {
    // Implementation would depend on chat functionality
    if (config.onReply) config.onReply(text);
  };
  
  const handleSave = () => {
    // Implementation would depend on saving functionality 
    if (config.onSave) config.onSave(text);
  };
  
  const handleHighlight = () => {
    // Implementation would depend on highlighting functionality
    if (config.onHighlight) config.onHighlight(text);
  };
  
  return (
    <div className={`chat-message group p-4 mb-4 rounded-lg ${isAi ? 'bg-gray-800' : 'bg-gray-900'}`}>
      {/* Message header */}
      <div className="flex items-center mb-2">
        {avatar && (
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <img src={avatar} alt={`${sender}'s avatar`} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex flex-col">
          <span className={`font-bold ${isAi ? 'text-blue-300' : 'text-green-300'}`}>{sender}</span>
          {showTimestamp && timestamp && (
            <span className="text-xs text-gray-500">{formattedTime}</span>
          )}
        </div>
      </div>
      
      {/* Message content */}
      <div className="pl-11"> {/* Align with the avatar */}
        {enableMarkdown ? (
          <EnhancedChatMessageContent 
            text={text} 
            sentiment={sentiment} 
            messageConfig={{ showSentiment }}
          />
        ) : (
          <p className="text-gray-200 whitespace-pre-wrap">{text}</p>
        )}
        
        {/* Message actions */}
        {showActions && (
          <MessageActions 
            onCopy={handleCopy}
            onReply={handleReply}
            onSave={handleSave}
            onHighlight={handleHighlight}
          />
        )}
      </div>
    </div>
  );
};

export { 
  EnhancedChatMessageContent as default,
  markdownToHtml,
  ThemedMarkdownContent,
  HighlightedMessage,
  CompleteChatMessage
};