const JsonViewer = ({ data }) => {
  const renderData = (data) => {
    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data)) {
        return (
          <ul>
            {data.map((item, index) => (
              <li key={index}>{renderData(item)}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <ul>
            {Object.entries(data).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {renderData(value)}
              </li>
            ))}
          </ul>
        );
      }
    } else {
      return <span>{String(data)}</span>;
    }
  };

  return <div>{renderData(data)}</div>;
};
export default JsonViewer;
