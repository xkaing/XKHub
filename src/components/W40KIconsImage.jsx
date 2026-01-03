const W40KIconsImage = ({ type, size = 48 }) => {
  const getIcon = (iconType) => {
    switch (iconType) {
      case "imperial-guard":
      case "帝国卫队":
        return (
          <img
            src="https://warhammer40000.com/wp-content/uploads/2023/07/3sqlyNhZXUl4grnx.png"
            alt="帝国卫队"
            width={size}
            height={size}
            style={{ objectFit: "contain" }}
          />
        );
      case "mechanicus":
      case "机械修会":
        return (
          <img
            src="https://warhammer40000.com/wp-content/uploads/2023/07/YB8TIAZIEl2smA3v.png"
            alt="机械修会"
            width={size}
            height={size}
            style={{ objectFit: "contain" }}
          />
        );
      case "custodes":
      case "帝国禁军":
        return (
          <img
            src="https://warhammer40000.com/wp-content/uploads/2023/07/kB0mGjCOUvY10oTp.png"
            alt="帝国禁军"
            width={size}
            height={size}
            style={{ objectFit: "contain" }}
          />
        );
      case "sisters":
      case "修女会":
        return (
          <img
            src="https://warhammer40000.com/wp-content/uploads/2023/07/8gl5TPhqAYn1KTgo.png"
            alt="修女会"
            width={size}
            height={size}
            style={{ objectFit: "contain" }}
          />
        );
      default:
        return null;
    }
  };

  return getIcon(type);
};

export default W40KIconsImage;

