import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';



const PdfViewer = ({src}) => {
  const [numPages, setNumPages] = useState(null);

  return (
    <div>
      <Document
        file=""
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;
