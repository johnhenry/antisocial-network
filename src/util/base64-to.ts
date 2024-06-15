/**
 * Converts a base64 string to a Uint8Array.
 *
 * @param {string} base64String - The base64 string to convert.
 * @returns {ArrayBuffer} The converted Uint8Array buffer.
 */
const base64to = (base64String: string): Uint8Array => {
  try {
    // https://stackoverflow.com/questions/26586403/invalid-character-error-while-using-atob-method
    const byteCharacters = atob(base64String.replace(/^[^,]+,/, ""));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  } catch (error) {
    console.log(error);
    return new Uint8Array();
  }
};

export default base64to;
