
import React, { useState, useEffect } from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, FormControlLabel, Switch } from '@mui/material';
import { Document, Image, PDFDownloadLink, PDFViewer, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';
import { useIntl } from 'react-intl';
import QRCode from 'qrcode';
import moment from 'moment';
import RobotoMedium from '../../../assets/text-font/Roboto-Medium.ttf';

const truncateAndWrapText = (text, maxLength) => {
    const removenextline = text.replace(/\n/g, ' ');

    // Replace multiple consecutive spaces with a single space
    const condensedText = removenextline.replace(/\s+/g, ' ');

    const words = condensedText.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if (lines.length >= 3) {
            // Maximum of 3 lines reached, stop processing
            break;
        }

        if (currentLine.length + word.length + 1 <= maxLength) {
            // Add the word to the current line if it doesn't exceed maxLength
            currentLine += (currentLine.length > 0 ? ' ' : '') + word;
        } else {
            // If adding the word exceeds maxLength, start a new line
            lines.push(currentLine);
            currentLine = word;
        }
    }

    // Push the last line
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    if (lines.length >= 2) {
        // If we have more than 3 lines, truncate and add "..." at the end
        lines.splice(2);
        const truncatedText = lines.join('\n');
        return `${truncatedText} ...`;
    }

    return lines.join('\n');
};

const PrintProductBarcodeList = ({ productList, onCancel }) => {
    const intl = useIntl();
    const [quantityFlag, setQuantityFlag] = useState(false);
    const [storeValue, setStoreValue] = useState('');

    useEffect(() => {
        const localStore = localStorage.getItem('store');
        if (localStore) {
            try {
                const parsedData = JSON.parse(localStore);
                setStoreValue(parsedData);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        }
    }, []);

    // Register a Ropbot font
    Font.register({
        family: 'RobotoMediumFont',
        src: RobotoMedium
    });

    const generateQRCodeImages = (productList, storeValue) => {
        const pages = [];
        let currentPageItems = [];
        const itemsPerPage = 2; // Number of items per page
        const addEmptyItemIfNeeded = () => {
            if (currentPageItems.length % 2 === 1) {
                // Add an empty item to make it even
                currentPageItems.push(
                    <View key={`empty-${currentPageItems.length}`} style={styles.column}></View>
                );
            }
        };

        (productList || []).forEach((data,) => {

            const QRCodeObj = {
                // expiryDate: data.expiryDate,
                barcode: data.barcode,
                productId: data.productId,
            }

            // Get QR code image url
            const qrCodeDataUrl = QRCode.toDataURL(JSON.stringify(QRCodeObj));

            // Check if data.expiryDate is a string and convert it to a Date object if needed
            const expiryDate = data.expiryDate instanceof Date ? data.expiryDate : new Date(data.expiryDate);

            // Check if expiryDate is a valid Date object before calling toISOString
            const expiryDateString = expiryDate instanceof Date ? expiryDate.toISOString() : '';
            const qty = data?.quantity;
            const quantityCount = !quantityFlag ? 1 : qty;

            for (let i = 0; i < quantityCount; i++) {

                const itemStyles = {
                    ...styles.column,
                    paddingLeft:4,
                    // border: '1px solid rgb(231 231 231) !important',
                };

                currentPageItems.push(
                    <View key={`${data.productId}-${i}`} style={itemStyles}>
                        <Text style={{ fontSize: '7px', textTransform: 'uppercase', marginTop: '2px', fontFamily:'RobotoMediumFont' }}>{storeValue?.name}</Text>
                        <View style={{ flexDirection: 'row', marginTop: '5px' }}>
                            <View style={{ width: '90px' }}>
                                <Image style={styles.qrCodeImage} src={qrCodeDataUrl} />
                            </View>
                            <View style={{ width: '90px', marginTop: '5px' }}>
                                <Text style={styles.value}>{data.vendorNumber}</Text>
                                <Text style={styles.value}>{data.productName}</Text>
                                <Text style={styles.value}>M.R.P. {Number(data.rate)?.toFixed(2)}</Text>
                                {data?.days !== 0 && (
                                    <Text style={styles.value}>EXP. {moment(expiryDateString).local().format('DD-MM-YY')}</Text>
                                )}
                                <Text style={styles.value}>{truncateAndWrapText(data.ingredients, 30)}</Text>
                                <Text style={styles.value}>Contact {storeValue?.mobileNumber}</Text>
                            </View>
                        </View>
                    </View>
                );

                if (currentPageItems.length >= itemsPerPage) {
                      // Add an empty item if needed to make it even
                addEmptyItemIfNeeded();

                    // Add a new page when the current page is full
                    pages.push(
                        <Page key={`page-${pages.length}`} 
                        size={{ width: 321, height:96 }} // A4 size in millimeters (210mm x 297mm)
                        style={styles.page}>
                            {currentPageItems}
                        </Page>
                    );
                    currentPageItems = [];
                }
            }
        });

         // Add any remaining items to the last page
    addEmptyItemIfNeeded();
        // Add any remaining items to the last page
        if (currentPageItems.length > 0) {
            pages.push(
                <Page key={`page-${pages.length}`} 
                size={{ width: 321, height:96 }} // A4 size in millimeters (210mm x 297mm)
                style={styles.page}>
                    {currentPageItems}
                </Page>
            );
        }

        return pages;
    };

    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent:'space-around',
            paddingTop:1
        },
        column: {
            width:'148px',
            height: '95px',
            padding:2
        },
        qrCodeImage: {
            width: '70px',
        },
        value: {
            fontSize: '7px',
            marginBottom: '2px',
            fontFamily:'RobotoMediumFont'
        },
    });

    const qrCodePages = generateQRCodeImages(productList, storeValue);

    const MyDocument = () => (
        <Document>
            {qrCodePages}
        </Document>
    );

    return (
        <Grid container>
            <Grid item xs={12} pb={2}>
                <Stack>
                    <DialogTitle className='model-header'>{intl.formatMessage({ id: 'ProductBarcodesTitle' })}</DialogTitle>
                    <Divider />
                    <Grid container>
                        <Grid item xs={12} sm={6} md={6}>
                            <Stack sx={{ marginLeft: "25px", marginBottom: "-16px !important", marginTop: "15px" }}>
                                {intl.formatMessage({ id: 'PrintBarCodeLabel' })}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControlLabel
                                value={quantityFlag}
                                onChange={(event) => {
                                    setQuantityFlag(event.target.checked);
                                }}
                                style={{ pointerEvents: "none", marginLeft: 0 }}
                                control={<Switch checked={quantityFlag} color="primary" style={{ pointerEvents: "auto" }} />}
                                label={intl.formatMessage({ id: 'All' })}
                                labelPlacement="start"
                                sx={{ float: 'right', marginBottom: "-16px !important", marginTop: "10px", marginRight: "20px" }}
                            />
                        </Grid>
                    </Grid>
                    <DialogContent>
                        <PDFDownloadLink document={<MyDocument />} fileName="qrcodes.pdf">
                            {({ loading }) => (loading ? 'Loading document...' : '')}
                        </PDFDownloadLink>
                        <PDFViewer width="100%" height={330}>
                            <MyDocument />
                        </PDFViewer>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 2.5, marginBottom: "-15px" }} className='model-footer'>
                        <Grid container justifyContent="end" alignItems="center">
                            <Grid item>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button
                                        className="gray-outline-btn"
                                        variant="text"
                                        color="secondary"
                                        onClick={onCancel}
                                        sx={{ color: 'secondary.dark' }}>
                                        {intl.formatMessage({ id: 'cancel' })}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default PrintProductBarcodeList;