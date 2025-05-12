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
      .replace(/~~(.*?)~~/g, '<span class="line-through">$1</span>');
  };

  // Handle emoji and special formatting markers
  const formatSpecialMarkers = (line) => {
    return line
      // Section markers with emoji
      .replace(/^🗣️ (.+)/, '<hr class="my-2 border-t border-gray-300"/><p class="font-bold text-lg my-1 text-gray-200"><span class="mr-2">🗣️</span>$1</p>')
      .replace(/^💡 (.+)/, '<hr class="my-2 border-t border-gray-300"/><p class="my-1 text-gray-200"><span class="font-bold text-yellow-300">💡 Tip: </span>$1</p>')
      .replace(/^🔍 (.+)/, '<hr class="my-2 border-t border-gray-300"/><p class="my-1 text-gray-200"><span class="font-bold text-blue-300">🔍 Analysis: </span>$1</p>')
      .replace(/^💬 (.+)/, '<hr class="my-2 border-t border-gray-300"/><p class="my-1 text-gray-200"><span class="font-bold text-green-300">💬 Note: </span>$1</p>')
      .replace(/^⚠️ (.+)/, '<hr class="my-2 border-t border-gray-300"/><p class="my-1 text-gray-200"><span class="font-bold text-red-300">⚠️ Warning: </span>$1</p>')
      .replace(/^🔑 (.+)/, '<hr class="my-2 border-t border-gray-300"/><p class="my-1 text-gray-200"><span class="font-bold text-purple-300">🔑 Key Point: </span>$1</p>')
      // Dividers
      .replace(/^---$/, '<hr class="my-2 border-t border-gray-200"/>')
      .replace(/^\*\*\*$/, '<hr class="my-2 border-t-2 border-gray-300"/>')
      // Checkboxes
      .replace(/^\[x\] (.+)/, '<div class="flex items-start mt-1"><div class="bg-green-500 text-white rounded-sm w-4 h-4 flex items-center justify-center mr-2 mt-0.5">✓</div><div>$1</div></div>')
      .replace(/^\[ \] (.+)/, '<div class="flex items-start mt-1"><div class="border border-gray-400 rounded-sm w-4 h-4 mr-2 mt-0.5"></div><div>$1</div></div>');
  };

  const processHeading = (line) => {
    const h1Match = line.match(/^# (.+)/);
    if (h1Match) return `<h1 class="text-2xl font-bold mt-6 mb-4">${processInlineFormatting(h1Match[1])}</h1>`;
    
    const h2Match = line.match(/^## (.+)/);
    if (h2Match) return `<h2 class="text-xl font-bold mt-5 mb-3">${processInlineFormatting(h2Match[1])}</h2>`;
    
    const h3Match = line.match(/^### (.+)/);
    if (h3Match) return `<h3 class="text-lg font-bold mt-4 mb-2">${processInlineFormatting(h3Match[1])}</h3>`;
    
    const h4Match = line.match(/^#### (.+)/);
    if (h4Match) return `<h4 class="text-base font-bold mt-3 mb-2">${processInlineFormatting(h4Match[1])}</h4>`;
    
    return null;
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

  // Main processing loop
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().substring(3).trim();
        codeContent = '';
        continue;
      } else {
        inCodeBlock = false;
        html += `<pre class="bg-gray-100 p-3 rounded-md my-3 overflow-x-auto"><code class="language-${codeLanguage} font-mono text-sm">${codeContent}</code></pre>`;
        continue;
      }
    }
    
    if (inCodeBlock) {
      codeContent += line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
      continue;
    }
    
    // Handle blockquotes
    if (line.trim().startsWith('>')) {
      const quoteContent = line.trim().substring(1).trim();
      if (!inQuoteBlock) {
        inQuoteBlock = true;
        html += '<blockquote class="pl-4 border-l-4 border-gray-300 text-gray-300 my-3">';
      }
      html += `<p>${processInlineFormatting(quoteContent)}</p>`;
      continue;
    } else if (inQuoteBlock) {
      inQuoteBlock = false;
      html += '</blockquote>';
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
    
    // Process special markers
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
    
    html += `<p class="my-2">${processInlineFormatting(line.trim())}</p>\n`;
  }

  // Close any remaining open elements
  if (inQuoteBlock) {
    html += '</blockquote>\n';
  }
  
  while (listContext.length > 0) {
    const closedList = listContext.pop();
    html += `</${closedList.type}>\n`;
  }

  return html;
}

/**
 * React component that renders chat message content with enhanced markdown support
 * @param {Object} props - Component props
 * @param {string} props.text - The markdown text to render
 * @returns {JSX.Element} - The rendered chat message content
 */
const EnhancedChatMessageContent = ({ text }) => {
  const htmlContent = useMemo(() => markdownToHtml(text || 'No message content'), [text]);
  
  return (
    <div 
      className="text-sm break-words prose prose-sm max-w-none text-gray-200 prose-ol:pl-6 prose-ul:pl-6 prose-ol:list-decimal prose-ul:list-disc prose-li:pl-2" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default EnhancedChatMessageContent;