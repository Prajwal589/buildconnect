export interface BuilderProfileSectionCompletion {
  key: string;
  label: string;
  percent: number;
  detail: string;
}

export const calculateBuilderProfileCompletion = (
  profile: any,
  formValues: {
    companyName?: string;
    address?: string;
    website?: string;
    logoUrl?: string;
    companyRegNo?: string;
    gstNo?: string;
    panNo?: string;
    uploadedDocs?: Array<{ name: string }>;
  } = {}
) => {
  const companyName = formValues.companyName ?? profile?.company_name;
  const address = formValues.address ?? profile?.address;
  const website = formValues.website ?? profile?.website;
  const logoUrl = formValues.logoUrl ?? profile?.logo_url;
  const companyRegNo = formValues.companyRegNo ?? profile?.company_reg_no;
  const gstNo = formValues.gstNo ?? profile?.gst_no;
  const panNo = formValues.panNo ?? profile?.pan_no;
  const uploadedDocs = formValues.uploadedDocs ?? [];

  const personalDetailsPercent = Math.round(
    (Boolean(profile?.email || formValues.companyName) ? 50 : 0) +
    (profile?.is_email_verified ? 50 : 0)
  );

  const companyDetailsPercent = Math.round(
    (companyName ? 25 : 0) +
    (address ? 25 : 0) +
    (website ? 25 : 0) +
    (logoUrl ? 25 : 0)
  );

  const bankDetailsPercent = Math.round(
    (companyRegNo ? 33.3 : 0) +
    (gstNo ? 33.3 : 0) +
    (panNo ? 33.4 : 0)
  );

  const documentsPercent = uploadedDocs.length > 0 || profile?.documents?.length > 0 || profile?.verification_status === 'approved'
    ? 100
    : 0;

  const sections: BuilderProfileSectionCompletion[] = [
    {
      key: 'personal-details',
      label: 'Personal Details',
      percent: personalDetailsPercent,
      detail: profile?.email ? 'Account verified and contact details available.' : 'Add account details to complete your profile.'
    },
    {
      key: 'company-details',
      label: 'Company Details',
      percent: companyDetailsPercent,
      detail: companyName ? 'Company profile details are in place.' : 'Add your company name and address to improve trust.'
    },
    {
      key: 'bank-details',
      label: 'Bank Details',
      percent: bankDetailsPercent,
      detail: companyRegNo || gstNo || panNo ? 'Essential registration details have been captured.' : 'Add registration and tax identifiers for verification.'
    },
    {
      key: 'documents',
      label: 'Documents',
      percent: documentsPercent,
      detail: uploadedDocs.length > 0 || profile?.documents?.length > 0 ? 'Verification documents are on file.' : 'Upload supporting documents to complete verification.'
    }
  ];

  const overall = Math.round(sections.reduce((sum, section) => sum + section.percent, 0) / sections.length);

  return { overall, sections };
};
