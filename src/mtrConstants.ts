import { MtrLine } from './types';

export const MTR_LINES: MtrLine[] = [
  {
    code: 'KTL',
    name_en: 'Kwun Tong Line',
    name_ch: '觀塘綫',
    color: '#00ab4e',
    stations: [
      { code: 'WHA', name_en: 'Whampoa', name_ch: '黃埔', lat: 22.304881, lng: 114.188712 },
      { code: 'HOM', name_en: 'Ho Man Tin', name_ch: '何文田', lat: 22.309452, lng: 114.181923 },
      { code: 'YMT', name_en: 'Yau Ma Tei', name_ch: '油麻地', lat: 22.313174, lng: 114.170535 },
      { code: 'MOK', name_en: 'Mong Kok', name_ch: '旺角', lat: 22.319121, lng: 114.169412 },
      { code: 'PRE', name_en: 'Prince Edward', name_ch: '太子', lat: 22.324742, lng: 114.168523 },
      { code: 'KOT', name_en: 'Kowloon Tong', name_ch: '九龍塘', lat: 22.337114, lng: 114.176145 },
      { code: 'LOF', name_en: 'Lok Fu', name_ch: '樂富', lat: 22.338581, lng: 114.188123 },
      { code: 'WTS', name_en: 'Wong Tai Sin', name_ch: '黃大仙', lat: 22.341642, lng: 114.193734 },
      { code: 'CHH', name_en: 'Diamond Hill', name_ch: '鑽石山', lat: 22.340121, lng: 114.201345 },
      { code: 'KOB', name_en: 'Kowloon Bay', name_ch: '九龍灣', lat: 22.323212, lng: 114.212123 },
      { code: 'NTK', name_en: 'Ngau Tau Kok', name_ch: '牛頭角', lat: 22.315434, lng: 114.219012 },
      { code: 'KWT', name_en: 'Kwun Tong', name_ch: '觀塘', lat: 22.312121, lng: 114.225123 },
      { code: 'LAT', name_en: 'Lam Tin', name_ch: '藍田', lat: 22.307212, lng: 114.233714 },
      { code: 'YAT', name_en: 'Yau Tong', name_ch: '油塘', lat: 22.298012, lng: 114.235123 },
      { code: 'TIK', name_en: 'Tiu Keng Leng', name_ch: '調景嶺', lat: 22.304912, lng: 114.253012 }
    ]
  },
  {
    code: 'ISL',
    name_en: 'Island Line',
    name_ch: '港島綫',
    color: '#0071ce',
    stations: [
      { code: 'KET', name_en: 'Kennedy Town', name_ch: '堅尼地城', lat: 22.281412, lng: 114.128712 },
      { code: 'HKU', name_en: 'HKU', name_ch: '香港大學', lat: 22.284412, lng: 114.138012 },
      { code: 'SYP', name_en: 'Sai Ying Pun', name_ch: '西營盤', lat: 22.286112, lng: 114.143012 },
      { code: 'SHW', name_en: 'Sheung Wan', name_ch: '上環', lat: 22.286412, lng: 114.151912 },
      { code: 'CEN', name_en: 'Central', name_ch: '中環', lat: 22.281912, lng: 114.158112 },
      { code: 'ADM', name_en: 'Admiralty', name_ch: '金鐘', lat: 22.279512, lng: 114.164512 },
      { code: 'WAC', name_en: 'Wan Chai', name_ch: '灣仔', lat: 22.277712, lng: 114.173112 },
      { code: 'CAB', name_en: 'Causeway Bay', name_ch: '銅鑼灣', lat: 22.280712, lng: 114.185012 },
      { code: 'TIN', name_en: 'Tin Hau', name_ch: '天后', lat: 22.282512, lng: 114.191712 },
      { code: 'FOH', name_en: 'Fortress Hill', name_ch: '炮台山', lat: 22.288512, lng: 114.193712 },
      { code: 'NPB', name_en: 'North Point', name_ch: '北角', lat: 22.291312, lng: 114.200612 },
      { code: 'QUB', name_en: 'Quarry Bay', name_ch: '鰂魚涌', lat: 22.291112, lng: 114.212112 },
      { code: 'TAK', name_en: 'Tai Koo', name_ch: '太古', lat: 22.284812, lng: 114.216312 },
      { code: 'SWH', name_en: 'Sai Wan Ho', name_ch: '西灣河', lat: 22.282212, lng: 114.222212 },
      { code: 'SKW', name_en: 'Shau Kei Wan', name_ch: '筲箕灣', lat: 22.279512, lng: 114.229712 },
      { code: 'HFC', name_en: 'Heng Fa Chuen', name_ch: '杏花邨', lat: 22.277212, lng: 114.240212 },
      { code: 'CHW', name_en: 'Chai Wan', name_ch: '柴灣', lat: 22.264712, lng: 114.236712 }
    ]
  },
  {
    code: 'TWL',
    name_en: 'Tsuen Wan Line',
    name_ch: '荃灣綫',
    color: '#e2231a',
    stations: [
      { code: 'CEN', name_en: 'Central', name_ch: '中環', lat: 22.281912, lng: 114.158112 },
      { code: 'ADM', name_en: 'Admiralty', name_ch: '金鐘', lat: 22.279512, lng: 114.164512 },
      { code: 'TST', name_en: 'Tsim Sha Tsui', name_ch: '尖沙咀', lat: 22.297512, lng: 114.172212 },
      { code: 'JOR', name_en: 'Jordan', name_ch: '佐敦', lat: 22.304912, lng: 114.171712 },
      { code: 'YMT', name_en: 'Yau Ma Tei', name_ch: '油麻地', lat: 22.313174, lng: 114.170535 },
      { code: 'MOK', name_en: 'Mong Kok', name_ch: '旺角', lat: 22.319121, lng: 114.169412 },
      { code: 'PRE', name_en: 'Prince Edward', name_ch: '太子', lat: 22.324742, lng: 114.168523 },
      { code: 'SSP', name_en: 'Sham Shui Po', name_ch: '深水埗', lat: 22.330712, lng: 114.161412 },
      { code: 'CSW', name_en: 'Cheung Sha Wan', name_ch: '長沙灣', lat: 22.335812, lng: 114.155812 },
      { code: 'LCK', name_en: 'Lai Chi Kok', name_ch: '荔枝角', lat: 22.337012, lng: 114.148112 },
      { code: 'MEF', name_en: 'Mei Foo', name_ch: '美孚', lat: 22.337212, lng: 114.140212 },
      { code: 'LAK', name_en: 'Lai King', name_ch: '荔景', lat: 22.348312, lng: 114.126512 },
      { code: 'KWF', name_en: 'Kwai Fong', name_ch: '葵芳', lat: 22.357012, lng: 114.127512 },
      { code: 'KWH', name_en: 'Kwai Hing', name_ch: '葵興', lat: 22.362712, lng: 114.131112 },
      { code: 'TWH', name_en: 'Tai Wo Hau', name_ch: '大窩口', lat: 22.370812, lng: 114.124112 },
      { code: 'TSW', name_en: 'Tsuen Wan', name_ch: '荃灣', lat: 22.373712, lng: 114.117712 }
    ]
  },
  {
    code: 'SIL',
    name_en: 'South Island Line',
    name_ch: '南港島綫',
    color: '#b5bd00',
    stations: [
      { code: 'ADM', name_en: 'Admiralty', name_ch: '金鐘', lat: 22.279512, lng: 114.164512 },
      { code: 'OCP', name_en: 'Ocean Park', name_ch: '海洋公園', lat: 22.247512, lng: 114.176412 },
      { code: 'WCH', name_en: 'Wong Chuk Hang', name_ch: '黃竹坑', lat: 22.247912, lng: 114.168712 },
      { code: 'LET', name_en: 'Lei Tung', name_ch: '利東', lat: 22.242512, lng: 114.154212 },
      { code: 'SOH', name_en: 'South Horizons', name_ch: '海怡半島', lat: 22.243512, lng: 114.148712 }
    ]
  },
  {
    code: 'TKL',
    name_en: 'Tseung Kwan O Line',
    name_ch: '將軍澳綫',
    color: '#a35eb5',
    stations: [
      { code: 'NOP', name_en: 'North Point', name_ch: '北角', lat: 22.291312, lng: 114.200612 },
      { code: 'QUB', name_en: 'Quarry Bay', name_ch: '鰂魚涌', lat: 22.291112, lng: 114.212112 },
      { code: 'YAT', name_en: 'Yau Tong', name_ch: '油塘', lat: 22.298012, lng: 114.235123 },
      { code: 'TIK', name_en: 'Tiu Keng Leng', name_ch: '調景嶺', lat: 22.304912, lng: 114.253012 },
      { code: 'TKO', name_en: 'Tseung Kwan O', name_ch: '將軍澳', lat: 22.307512, lng: 114.260012 },
      { code: 'LHP', name_en: 'LOHAS Park', name_ch: '康城', lat: 22.295112, lng: 114.268712 },
      { code: 'HAH', name_en: 'Hang Hau', name_ch: '坑口', lat: 22.315812, lng: 114.264212 },
      { code: 'POA', name_en: 'Po Lam', name_ch: '寶琳', lat: 22.322512, lng: 114.258112 }
    ]
  },
  {
    code: 'TCL',
    name_en: 'Tung Chung Line',
    name_ch: '東涌綫',
    color: '#f3a112',
    stations: [
      { code: 'HOK', name_en: 'Hong Kong', name_ch: '香港', lat: 22.284712, lng: 114.158112 },
      { code: 'KOW', name_en: 'Kowloon', name_ch: '九龍', lat: 22.304112, lng: 114.161412 },
      { code: 'OLY', name_en: 'Olympic', name_ch: '奧運', lat: 22.317812, lng: 114.160312 },
      { code: 'NAC', name_en: 'Nam Cheong', name_ch: '南昌', lat: 22.327512, lng: 114.153412 },
      { code: 'LAK', name_en: 'Lai King', name_ch: '荔景', lat: 22.348312, lng: 114.126512 },
      { code: 'TSY', name_en: 'Tsing Yi', name_ch: '青衣', lat: 22.358512, lng: 114.107512 },
      { code: 'SUN', name_en: 'Sunny Bay', name_ch: '欣澳', lat: 22.335112, lng: 114.028712 },
      { code: 'TUC', name_en: 'Tung Chung', name_ch: '東涌', lat: 22.289112, lng: 113.939412 }
    ]
  },
  {
    code: 'AEL',
    name_en: 'Airport Express',
    name_ch: '機場快綫',
    color: '#00888a',
    stations: [
      { code: 'HOK', name_en: 'Hong Kong', name_ch: '香港', lat: 22.284712, lng: 114.158112 },
      { code: 'KOW', name_en: 'Kowloon', name_ch: '九龍', lat: 22.304112, lng: 114.161412 },
      { code: 'TSY', name_en: 'Tsing Yi', name_ch: '青衣', lat: 22.358512, lng: 114.107512 },
      { code: 'AIR', name_en: 'Airport', name_ch: '機場', lat: 22.315512, lng: 113.934812 },
      { code: 'AWE', name_en: 'AsiaWorld-Expo', name_ch: '博覽館', lat: 22.321412, lng: 113.942112 }
    ]
  },
  {
    code: 'TML',
    name_en: 'Tuen Ma Line',
    name_ch: '屯馬綫',
    color: '#9a3820',
    stations: [
      { code: 'WKS', name_en: 'Wu Kai Sha', name_ch: '烏溪沙', lat: 22.428512, lng: 114.243512 },
      { code: 'MOS', name_en: 'Ma On Shan', name_ch: '馬鞍山', lat: 22.424512, lng: 114.231512 },
      { code: 'HEO', name_en: 'Heng On', name_ch: '恆安', lat: 22.417512, lng: 114.226512 },
      { code: 'TSH', name_en: 'Tai Shui Hang', name_ch: '大水坑', lat: 22.409512, lng: 114.221512 },
      { code: 'SHM', name_en: 'Shek Mun', name_ch: '石門', lat: 22.387512, lng: 114.208512 },
      { code: 'CIO', name_en: 'City One', name_ch: '第一城', lat: 22.382512, lng: 114.203512 },
      { code: 'STW', name_en: 'Sha Tin Wai', name_ch: '沙田圍', lat: 22.376512, lng: 114.193512 },
      { code: 'CKT', name_en: 'Che Kung Temple', name_ch: '車公廟', lat: 22.374512, lng: 114.185512 },
      { code: 'TAW', name_en: 'Tai Wai', name_ch: '大圍', lat: 22.372512, lng: 114.178512 },
      { code: 'HIK', name_en: 'Hin Keng', name_ch: '顯徑', lat: 22.361512, lng: 114.173512 },
      { code: 'DIH', name_en: 'Diamond Hill', name_ch: '鑽石山', lat: 22.340121, lng: 114.201345 },
      { code: 'KAT', name_en: 'Kai Tak', name_ch: '啟德', lat: 22.331512, lng: 114.198512 },
      { code: 'SUW', name_en: 'Sung Wong Toi', name_ch: '宋皇臺', lat: 22.328512, lng: 114.191512 },
      { code: 'TKW', name_en: 'To Kwa Wan', name_ch: '土瓜灣', lat: 22.320512, lng: 114.188512 },
      { code: 'HOM', name_en: 'Ho Man Tin', name_ch: '何文田', lat: 22.309452, lng: 114.181923 },
      { code: 'HMT', name_en: 'Hung Hom', name_ch: '紅磡', lat: 22.302912, lng: 114.181412 },
      { code: 'ETS', name_en: 'East Tsim Sha Tsui', name_ch: '尖東', lat: 22.295112, lng: 114.174812 },
      { code: 'AUS', name_en: 'Austin', name_ch: '柯士甸', lat: 22.304712, lng: 114.165112 },
      { code: 'NAC', name_en: 'Nam Cheong', name_ch: '南昌', lat: 22.327512, lng: 114.153412 },
      { code: 'MEF', name_en: 'Mei Foo', name_ch: '美孚', lat: 22.337212, lng: 114.140212 },
      { code: 'TWW', name_en: 'Tsuen Wan West', name_ch: '荃灣西', lat: 22.368512, lng: 114.111412 },
      { code: 'KSR', name_en: 'Kam Sheung Road', name_ch: '錦上路', lat: 22.434112, lng: 114.063712 },
      { code: 'YUL', name_en: 'Yuen Long', name_ch: '元朗', lat: 22.445412, lng: 114.036512 },
      { code: 'LOP', name_en: 'Long Ping', name_ch: '朗屏', lat: 22.447512, lng: 114.029812 },
      { code: 'TIS', name_en: 'Tin Shui Wai', name_ch: '天水圍', lat: 22.444412, lng: 114.003512 },
      { code: 'SIH', name_en: 'Siu Hong', name_ch: '兆康', lat: 22.412412, lng: 113.979512 },
      { code: 'TUM', name_en: 'Tuen Mun', name_ch: '屯門', lat: 22.394412, lng: 113.974512 }
    ]
  },
  {
    code: 'EAL',
    name_en: 'East Rail Line',
    name_ch: '東鐵綫',
    color: '#53b7e8',
    stations: [
      { code: 'ADM', name_en: 'Admiralty', name_ch: '金鐘', lat: 22.279512, lng: 114.164512 },
      { code: 'EXC', name_en: 'Exhibition Centre', name_ch: '會展', lat: 22.282512, lng: 114.174512 },
      { code: 'HMT', name_en: 'Hung Hom', name_ch: '紅磡', lat: 22.302912, lng: 114.181412 },
      { code: 'MKK', name_en: 'Mong Kok East', name_ch: '旺角東', lat: 22.322112, lng: 114.171712 },
      { code: 'KOT', name_en: 'Kowloon Tong', name_ch: '九龍塘', lat: 22.337114, lng: 114.176145 },
      { code: 'TAW', name_en: 'Tai Wai', name_ch: '大圍', lat: 22.372512, lng: 114.178512 },
      { code: 'SHT', name_en: 'Sha Tin', name_ch: '沙田', lat: 22.382512, lng: 114.187512 },
      { code: 'FOT', name_en: 'Fo Tan', name_ch: '火炭', lat: 22.396512, lng: 114.191512 },
      { code: 'RAC', name_en: 'Racecourse', name_ch: '馬場', lat: 22.400512, lng: 114.201512 },
      { code: 'UNI', name_en: 'University', name_ch: '大學', lat: 22.412512, lng: 114.210512 },
      { code: 'TAP', name_en: 'Tai Po Market', name_ch: '大埔墟', lat: 22.444512, lng: 114.170512 },
      { code: 'TWO', name_en: 'Tai Wo', name_ch: '太和', lat: 22.450512, lng: 114.161512 },
      { code: 'FAN', name_en: 'Fanling', name_ch: '粉嶺', lat: 22.492512, lng: 114.139512 },
      { code: 'SHS', name_en: 'Sheung Shui', name_ch: '上水', lat: 22.501512, lng: 114.127512 },
      { code: 'LOW', name_en: 'Lo Wu', name_ch: '羅湖', lat: 22.529512, lng: 114.112512 },
      { code: 'LMC', name_en: 'Lok Ma Chau', name_ch: '落馬洲', lat: 22.515512, lng: 114.066512 }
    ]
  }
];
