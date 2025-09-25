import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

function ReceiptUpload() {
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  React.useEffect(() => {
    if (extractedData) {
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));
    }
  }, [extractedData]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFileSelect = (file) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select an image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processReceipt = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await axios.post('/process-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);

      setExtractedData(response.data);

      if (response.data.rawText) {
        const text = response.data.rawText;
      
        // Find all money values
        const amounts = [...text.matchAll(/\$([\d,.]+)/g)].map(m =>
          parseFloat(m[1].replace(/,/g, ''))
        );
      
        let total = '';
        // 1. Prefer an explicitly labeled total line
        const totalLine = text.split('\n').find(line =>
          /(total|amount due|balance due|grand total|amount payable)/i.test(line)
        );
        if (totalLine) {
          const match = totalLine.match(/\$([\d,.]+)/);
          if (match) {
            total = parseFloat(match[1].replace(/,/g, ''));
          }
        }
      
        // 2. If not found, fallback to SUM of all values
        if (!total && amounts.length) {
          total = amounts.reduce((sum, val) => sum + val, 0);
        }
      
        // Extract date (e.g., "April 5, 2024")
        const dateMatch = text.match(/\b(?:[A-Za-z]+ \d{1,2}, \d{4})\b/);

        const parsedDate = dateMatch
          ? new Date(dateMatch[0]).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
      
        setFormData(prev => ({
          ...prev,
          type: 'expense',
          amount: total,
          date: parsedDate,
          description: 'Imported from receipt',
          category: ''
        }));
      }      

    } catch (error) {
      setError('Failed to process receipt. Please try again or enter the details manually.');
      console.error('Receipt processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/transactions', formData);
      setSuccess('Transaction added successfully!');

      // Reset form
      setSelectedFile(null);
      setExtractedData(null);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save transaction');
      console.error('Transaction save error:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredCategories = categories.filter(cat =>
    cat.type === formData.type
  );

  return (
    <UploadContainer>
      <Title>Receipt Upload & Processing</Title>

      <UploadSection>
        <SectionTitle>Upload Receipt</SectionTitle>

        <DropZone
          isDragging={isDragging}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <DropZoneIcon>📄</DropZoneIcon>
          <DropZoneText>
            Drop your receipt here or click to browse
          </DropZoneText>
          <DropZoneSubtext>
            Supports images JPG and PNG files up to 5MB
          </DropZoneSubtext>
        </DropZone>

        <FileInput
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileInputChange}
        />

        {selectedFile && (
          <SelectedFile>
            <div>📎</div>
            <FileInfo>
              <FileName>{selectedFile.name}</FileName>
              <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
            </FileInfo>
            <RemoveButton onClick={removeFile}>Remove</RemoveButton>
          </SelectedFile>
        )}

        {selectedFile && !extractedData && (
          <ProcessButton
            onClick={processReceipt}
            disabled={processing}
          >
            {processing ? 'Processing Receipt...' : 'Process Receipt'}
          </ProcessButton>
        )}

        {processing && (
          <LoadingMessage>
            Analyzing receipt... This may take a few moments.
          </LoadingMessage>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </UploadSection>

      {extractedData && (
        <ResultSection>
          <SectionTitle>Extracted Receipt</SectionTitle>

          <ReceiptPreview>
            {extractedData.rawText.split("\n").map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </ReceiptPreview>

          <Form onSubmit={handleFormSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Description</Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description"
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="button" onClick={() => {
                setSelectedFile(null);
                setExtractedData(null);
                setFormData({
                  type: 'expense',
                  amount: '',
                  category: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0]
                });
              }}>
                Clear
              </Button>
              <Button type="submit" variant="primary">
                Save Transaction
              </Button>
            </ButtonGroup>
          </Form>

          {success && <SuccessMessage>{success}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ResultSection>
      )}


    </UploadContainer>
  );
}

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: 2rem;
  font-weight: 600;
`;

const UploadSection = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.boxShadow};
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.xl * 2};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? props.theme.colors.light : 'transparent'};
  border-color: ${props => props.isDragging ? props.theme.colors.primary : props.theme.colors.border};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.light};
  }
`;

const DropZoneIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textMuted};
`;

const DropZoneText = styled.div`
  color: ${props => props.theme.colors.textMuted};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DropZoneSubtext = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
`;

const FileInput = styled.input`
  display: none;
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.light};
  border-radius: ${props => props.theme.borderRadius};
  margin-top: ${props => props.theme.spacing.md};
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
`;

const RemoveButton = styled.button`
  background: ${props => props.theme.colors.danger};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: #c82333;
  }
`;

const ProcessButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: ${props => props.theme.spacing.lg};
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: ${props => props.theme.colors.secondary};
    cursor: not-allowed;
  }
`;

const ResultSection = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.boxShadow};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.25rem;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 1rem;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 1rem;
  background: white;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#0056b3' : '#545b62'};
  }

  &:disabled {
    background: ${props => props.theme.colors.secondary};
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textMuted};
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius};
  margin-top: ${props => props.theme.spacing.md};
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius};
  margin-top: ${props => props.theme.spacing.md};
  border: 1px solid #c3e6cb;
`;

const ReceiptPreview = styled.div`
  white-space: pre-wrap;
  background: ${props => props.theme.colors.light};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  font-family: monospace;
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const DefaultCategory = styled.div`
  font-size: 1rem;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
`;

export default ReceiptUpload;