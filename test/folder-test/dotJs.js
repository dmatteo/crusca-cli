export default () => {
  const t = (string) => string;

  const str1 = t('translate me');
  const str2 = t(`translate me too plz`);
  const str3 = t`I can haz translations too`;
}
