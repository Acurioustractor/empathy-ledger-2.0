import { redirect } from 'next/navigation';

export default function OrganisationPage() {
  // Redirect to the plural form which contains the main organisations content
  redirect('/organisations');
}