import { NextResponse } from 'next/server';

export const sendResponse = (
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null
) => {
  return NextResponse.json({ success, message, data }, { status: statusCode });
};
