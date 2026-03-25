export interface LrtRoute {
  train_length: number;
  arrival_departure: string;
  dest_en: string;
  dest_ch: string;
  time_en: string;
  time_ch: string;
  route_no: string;
  stop: number;
}

export interface LrtPlatform {
  platform_id: number;
  route_list: LrtRoute[];
}

export interface LrtScheduleResponse {
  status: number;
  system_time: string;
  platform_list: LrtPlatform[];
}

export interface LrtStation {
  id: number;
  name_en: string;
  name_ch: string;
  lat: number;
  lng: number;
}

export interface MtrStation {
  code: string;
  name_en: string;
  name_ch: string;
  lat?: number;
  lng?: number;
}

export interface MtrLine {
  code: string;
  name_en: string;
  name_ch: string;
  color: string;
  stations: MtrStation[];
}

export interface MtrEta {
  plat: string;
  dest: string;
  time: string;
  ttnt: string;
  valid: string;
}

export interface MtrScheduleResponse {
  status: number;
  message: string;
  curr_time: string;
  sys_time: string;
  data: {
    [key: string]: {
      curr_time: string;
      sys_time: string;
      UP?: MtrEta[];
      DOWN?: MtrEta[];
    };
  };
}
