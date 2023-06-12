for secret in $(gcloud secrets list --format='value(NAME)')
do
  gcloud secrets delete $secret --quiet
done
