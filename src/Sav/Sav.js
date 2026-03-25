import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import BASE_URL from '../Utilis/constantes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Select, MenuItem, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const FormContainer = styled.div`
width:100% ;
 margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #34495e;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.primary && `
    background: #4299e1;
    color: white;
    border: none;
    &:hover { background: #3182ce; }
  `}
  
  ${props => props.secondary && `
    background: white;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    &:hover { background: #f7fafc; }
  `}
`;
const CheckboxContainer = styled.div`
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  background: ${props => props.checked ? '#4299e1' : 'white'};
  color: ${props => props.checked ? 'white' : '#4a5568'};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

const HiddenCheckbox = styled.input`
  display: none;
`;

const CheckboxIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid ${props => props.checked ? 'white' : '#cbd5e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:after {
    content: '✓';
    color: white;
    display: ${props => props.checked ? 'block' : 'none'};
  }
`;
const FileUploadContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: white;
  border: 2px dashed #4299e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f9ff;
  }
`;

const FilePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const PreviewItem = styled.div`
  position: relative;
  padding: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`;
const SavRequestForm = () => {
  const [files, setFiles] = useState([]);
  const user = useSelector((state) => state.user);
  const isMagasinier = user?.ROLE === 'magasinier';
  useEffect(() => {
    if (isMagasinier) {
      setFormData(prev => ({
        ...prev,
        MAGASINIER: user.LOGIN
      }));
    }
  }, [user, isMagasinier]);

  const [currentUser, setCurrentUser] = useState({
    USER_NAME: ''
  });
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/users`, {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.username);
          setFormData(prev => ({
            ...prev,
            USER_NAME: userData.username
          }));
        }
      } catch (error) {
        console.log('Error fetching user:', error);
      }
    };

    fetchCurrentUser();
  }, []);
  const [formData, setFormData] = useState({
    MAGASINIER: isMagasinier ? user.LOGIN : '',
    RECEPTION: '',
    USER_NAME: user?.LOGIN || '',
    DEMAND_DATE: new Date().toISOString().split('T')[0],
    PNEU: '',
    DESCRIPTION: '',
    DOT: '',
    GROSSISTE: '',
    VENDEUR: '',
    UTILISATEUR: '',
    ADRESSE: '',
    VEHICULE: '',
    MARQUE: '',
    MATRICULE: '',
    PARCOURS: '',
    CHARGE: '',
    KM: '',
    TYPE_UTILISATION: '',
    DECISION: '',
    SERIE: '',
    GAMME: '',
    RAISON: '',
    MAGASINIER: '',
    RECEPTION: '',
    TLP: ''

  });

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.PNEU || !formData.SERIE || !formData.DESCRIPTION) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const formDataToSend = new FormData();


    const updatedFormData = {
      ...formData,
      USER_NAME: user.LOGIN
    };
    files.forEach((file) => {
      formDataToSend.append('files', file);
    });


    Object.keys(updatedFormData).forEach(key => {
      formDataToSend.append(key, updatedFormData[key]);
    });
    try {
      const response = await fetch(`${BASE_URL}/api/createSavMagasin`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Server response:', data);

        toast.success('🎉 Réclamation créée avec succès!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: '#4299e1',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '16px',
            marginTop: '320px',
          }
        });

        setFormData({
          USER_NAME: '',
          DEMAND_DATE: new Date().toISOString().split('T')[0],
          PNEU: '',
          DESCRIPTION: '',
          DOT: '',
          GROSSISTE: '',
          VENDEUR: '',
          UTILISATEUR: '',
          ADRESSE: '',
          VEHICULE: '',
          MARQUE: '',
          MATRICULE: '',
          PARCOURS: '',
          CHARGE: '',
          KM: '',
          TYPE_UTILISATION: '',
          DECISION: '',
          SERIE: '',
          GAMME: '',
          RAISON: '',
          MAGASINIER: '',
          RECEPTION: '',
          TLP: ''

        });
        setFiles([]);
      } else {
        const contentType = response.headers.get("content-type");
        const data = contentType && contentType.includes("application/json")
          ? await response.json()
          : await response.text();
        toast.error(`Erreur: ${data.message || 'Échec de création de la demande'}`);
      }
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />


      <FormContainer>
        <Typography style={{ color: 'red', fontWeight: 'bold' }}>
          Noté Bien : Chaque formulaire de service après-vente sert à réclamer un seul article.
        </Typography>
        <FormTitle>Fiche de réclamation  </FormTitle>


        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Information Utilisateur</SectionTitle>
            <InputGrid>
              <InputGroup>
                <Label>Nom d'utilisateur</Label>
                <Input
                  type="text"
                  name="USER_NAME"
                  value={formData.USER_NAME}
                  disabled
                />
              </InputGroup>
            </InputGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Information Produit</SectionTitle>
            <InputGrid>
              <InputGroup>
                <Label>Pneu</Label>
                <Input
                  type="text"
                  name="PNEU"
                  value={formData.PNEU}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Gamme</Label>
                <Input
                  type="text"
                  name="GAMME"
                  value={formData.GAMME}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Date de fabrication (D.O.T) </Label>
                <Input
                  type="date"
                  name="DOT"
                  value={formData.DOT}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>N° de série </Label>
                <Input
                  type="text"
                  name="SERIE"
                  value={formData.SERIE}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </InputGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Information client</SectionTitle>
            <InputGrid>
              <InputGroup>
                <Label>Grossiste</Label>
                <Input
                  type="text"
                  name="GROSSISTE"
                  value={formData.GROSSISTE}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Vendeur direct</Label>
                <Input
                  type="text"
                  name="VENDEUR"
                  value={formData.VENDEUR}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>N° de télephone </Label>
                <Input
                  type="text"
                  name="TLP"
                  value={formData.TLP}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Utilisateur</Label>
                <Input
                  type="text"
                  name="UTILISATEUR"
                  value={formData.UTILISATEUR}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Adresse</Label>
                <Input
                  type="text"
                  name="ADRESSE"
                  value={formData.ADRESSE}
                  onChange={handleChange}
                />
              </InputGroup>
            </InputGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Information Véhicule</SectionTitle>
            <InputGrid>
              <InputGroup>
                <Label>Véhicule</Label>
                <Input
                  type="text"
                  name="VEHICULE"
                  value={formData.VEHICULE}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Marque</Label>
                <Input
                  type="text"
                  name="MARQUE"
                  value={formData.MARQUE}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>N° matricule</Label>
                <Input
                  type="text"
                  name="MATRICULE"
                  value={formData.MATRICULE}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Type de parcours</Label>
                <Input
                  type="text"
                  name="PARCOURS"
                  value={formData.PARCOURS}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Charge véhicule</Label>
                <Input
                  type="text"
                  name="CHARGE"
                  value={formData.CHARGE}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Kilométrages</Label>
                <Input
                  type="text"
                  name="KM"
                  value={formData.KM}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup>
                <Label>Type d'utilisation</Label>
                <Input
                  type="text"
                  name="TYPE_UTILISATION"
                  value={formData.TYPE_UTILISATION}
                  onChange={handleChange}
                />
              </InputGroup>
            </InputGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Description</SectionTitle>
            <TextArea
              name="DESCRIPTION"
              value={formData.DESCRIPTION}
              onChange={handleChange}
              required
            />
          </FormSection>

          {/*  <SectionTitle>Documents et Photos</SectionTitle>
          <FileUploadContainer>
            <FileUploadLabel>
              <FileInput
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
              📎 Ajouter des fichiers ou images
            </FileUploadLabel>

            <FilePreview>
              {files.map((file, index) => (
                <PreviewItem key={index}>
                  {file.type.startsWith('image/') ? (
                    <PreviewImage
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      onLoad={() => {
                        // Clean up object URL after image loads
                        URL.revokeObjectURL(file);
                      }}
                    />
                  ) : (
                    <div>
                      📄 {file.name}
                      <small>({(file.size / 1024).toFixed(2)} KB)</small>
                    </div>
                  )}
                  <Button
                    secondary
                    onClick={() => {
                      URL.revokeObjectURL(file); // Clean up object URL
                      removeFile(index);
                    }}
                    style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px 8px' }}
                  >
                    ✕
                  </Button>
                </PreviewItem>
              ))}
            </FilePreview>

          </FileUploadContainer>
        <SectionTitle>Décision S/D Assistance Technique</SectionTitle>
          <CheckboxContainer>
            {['geste commercial', 'Bonifié', 'Non bonifié'].map((option) => (
              <CheckboxLabel
                key={option}
                checked={formData.DECISION === option}
                onClick={() => setFormData({
                  ...formData,
                  DECISION: option
                })}
                disabled={user?.ROLE !== 'administrateur'}  // Désactive le champ si l'utilisateur n'est pas magasinier

              >
                <HiddenCheckbox
                  type="checkbox"
                  checked={formData.DECISION === option}
                  onChange={() => { }}
                  disabled={user?.ROLE !== 'administrateur'}  // Désactive le champ si l'utilisateur n'est pas magasinier

                />
                <CheckboxIcon checked={formData.DECISION === option} />
                {option}
              </CheckboxLabel>
            ))}   <Label>Avis</Label>
            <InputGrid>

              <InputGroup>

                <Input
                  type="text"
                  name="RAISON"
                  value={formData.RAISON}
                  onChange={handleChange}
                />
              </InputGroup>
            </InputGrid>
          </CheckboxContainer>*/}
          <SectionTitle>Etat de réception de produit</SectionTitle>
          <CheckboxContainer>
            <Select
              name="RECEPTION"
              value={formData.RECEPTION}
              onChange={handleChange}
              displayEmpty
              disabled={user?.ROLE !== 'magasinier'}  // Désactive le champ si l'utilisateur n'est pas magasinier

            >
              <MenuItem value="" disabled>
                Sélectionner une option
              </MenuItem>
              <MenuItem value="Récue par le magasinier">Récue par le magasinier</MenuItem>
              <MenuItem value="Non Récue par le magasinier">Non Récue par le magasinier</MenuItem>
            </Select>
            <Label>Magasinier</Label>

            <InputGrid>
              <InputGroup>
                <Input
                  type="text"
                  name="MAGASINIER"
                  value={formData.MAGASINIER}
                  disabled
                />
              </InputGroup>
            </InputGrid>
          </CheckboxContainer>


          <ButtonGroup>
            <Button type="button" secondary onClick={() => setFormData({})}>
              Annuler
            </Button>
            <Button type="submit" primary>
              Soumettre
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </>
  );
};

export default SavRequestForm;
