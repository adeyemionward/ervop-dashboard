import {
  CSSObjectWithLabel,
  ControlProps,
  StylesConfig
} from "react-select";

export interface Option {
  value: string;
  label: string;
}

export const customStyles: StylesConfig<Option, false> = {
  control: (
    provided: CSSObjectWithLabel,
    state: ControlProps<Option, false>
  ) => ({
    ...provided,
    minHeight: "50px",
    height: "50px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#9333EA" : "#D1D5DB",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(147, 51, 234, 0.5)"
      : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#9333EA" : "#9CA3AF",
    },
  }),

  input: (provided: CSSObjectWithLabel) => ({
    ...provided,
    margin: "0px",
  }),

  indicatorsContainer: (provided: CSSObjectWithLabel) => ({
    ...provided,
    height: "50px",
  }),
};


export const currencyOptions = [
  { value: "AED - United Arab Emirates Dirham", label: "AED - United Arab Emirates Dirham" },
  { value: "AFN - Afghan Afghani", label: "AFN - Afghan Afghani" },
  { value: "ALL - Albanian Lek", label: "ALL - Albanian Lek" },
  { value: "AMD - Armenian Dram", label: "AMD - Armenian Dram" },
  { value: "ANG - Netherlands Antillean Guilder", label: "ANG - Netherlands Antillean Guilder" },
  { value: "AOA - Angolan Kwanza", label: "AOA - Angolan Kwanza" },
  { value: "ARS - Argentine Peso", label: "ARS - Argentine Peso" },
  { value: "AUD - Australian Dollar", label: "AUD - Australian Dollar" },
  { value: "AWG - Aruban Florin", label: "AWG - Aruban Florin" },
  { value: "AZN - Azerbaijani Manat", label: "AZN - Azerbaijani Manat" },
  { value: "BAM - Bosnia-Herzegovina Convertible Mark", label: "BAM - Bosnia-Herzegovina Convertible Mark" },
  { value: "BBD - Barbadian Dollar", label: "BBD - Barbadian Dollar" },
  { value: "BDT - Bangladeshi Taka", label: "BDT - Bangladeshi Taka" },
  { value: "BGN - Bulgarian Lev", label: "BGN - Bulgarian Lev" },
  { value: "BHD - Bahraini Dinar", label: "BHD - Bahraini Dinar" },
  { value: "BIF - Burundian Franc", label: "BIF - Burundian Franc" },
  { value: "BMD - Bermudian Dollar", label: "BMD - Bermudian Dollar" },
  { value: "BND - Brunei Dollar", label: "BND - Brunei Dollar" },
  { value: "BOB - Bolivian Boliviano", label: "BOB - Bolivian Boliviano" },
  { value: "BRL - Brazilian Real", label: "BRL - Brazilian Real" },
  { value: "BSD - Bahamian Dollar", label: "BSD - Bahamian Dollar" },
  { value: "BTN - Bhutanese Ngultrum", label: "BTN - Bhutanese Ngultrum" },
  { value: "BWP - Botswanan Pula", label: "BWP - Botswanan Pula" },
  { value: "BYN - Belarusian Ruble", label: "BYN - Belarusian Ruble" },
  { value: "BZD - Belize Dollar", label: "BZD - Belize Dollar" },
  { value: "CAD - Canadian Dollar", label: "CAD - Canadian Dollar" },
  { value: "CDF - Congolese Franc", label: "CDF - Congolese Franc" },
  { value: "CHF - Swiss Franc", label: "CHF - Swiss Franc" },
  { value: "CLP - Chilean Peso", label: "CLP - Chilean Peso" },
  { value: "CNY - Chinese Yuan", label: "CNY - Chinese Yuan" },
  { value: "COP - Colombian Peso", label: "COP - Colombian Peso" },
  { value: "CRC - Costa Rican Colón", label: "CRC - Costa Rican Colón" },
  { value: "CUP - Cuban Peso", label: "CUP - Cuban Peso" },
  { value: "CVE - Cape Verdean Escudo", label: "CVE - Cape Verdean Escudo" },
  { value: "CZK - Czech Koruna", label: "CZK - Czech Koruna" },
  { value: "DJF - Djiboutian Franc", label: "DJF - Djiboutian Franc" },
  { value: "DKK - Danish Krone", label: "DKK - Danish Krone" },
  { value: "DOP - Dominican Peso", label: "DOP - Dominican Peso" },
  { value: "DZD - Algerian Dinar", label: "DZD - Algerian Dinar" },
  { value: "EGP - Egyptian Pound", label: "EGP - Egyptian Pound" },
  { value: "ERN - Eritrean Nakfa", label: "ERN - Eritrean Nakfa" },
  { value: "ETB - Ethiopian Birr", label: "ETB - Ethiopian Birr" },
  { value: "EUR - Euro", label: "EUR - Euro" },
  { value: "FJD - Fijian Dollar", label: "FJD - Fijian Dollar" },
  { value: "FKP - Falkland Islands Pound", label: "FKP - Falkland Islands Pound" },
  { value: "GBP - British Pound Sterling", label: "GBP - British Pound Sterling" },
  { value: "GHS - Ghanaian Cedi", label: "GHS - Ghanaian Cedi" },
  { value: "GMD - Gambian Dalasi", label: "GMD - Gambian Dalasi" },
  { value: "GNF - Guinean Franc", label: "GNF - Guinean Franc" },
  { value: "KES - Kenyan Shilling", label: "KES - Kenyan Shilling" },
  { value: "NGN - Nigerian Naira", label: "NGN - Nigerian Naira" },
  { value: "USD - United States Dollar", label: "USD - United States Dollar" },
  { value: "ZAR - South African Rand", label: "ZAR - South African Rand" },
  { value: "ZMW - Zambian Kwacha", label: "ZMW - Zambian Kwacha" },
  { value: "ZWL - Zimbabwean Dollar", label: "ZWL - Zimbabwean Dollar" },
];

