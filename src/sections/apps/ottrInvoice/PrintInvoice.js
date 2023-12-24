import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack } from '@mui/material'
import { Document, PDFDownloadLink, Font, PDFViewer, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useIntl } from 'react-intl';
import moment from 'moment';
import NotoSansDevanagariRegular from '../../../assets/text-font/NotoSansDevanagari-Regular.ttf';
import NotoSansDevanagariBold from '../../../assets/text-font/NotoSansDevanagari_Condensed-Bold.ttf'

const PrintInvoice = ({ invoice, onCancel }) => {
    const intl = useIntl();

    const styles = StyleSheet.create({
        page: {
            backgroundColor: '#ffffff',
            // padding: '1cm'
            paddingHorizontal: '20px'
        },
        section: {
            flexDirection: 'row',
            flexWrap: 'wrap'
        },
        column: {
            flexDirection: 'column',
            // flexWrap: 'wrap',
            width: '20%'
        },
        logo: {
            width: '60px',
            height: '60px',
            margin: '10px',
            alignSelf: 'flex-end'
        },
        keyValueContainer: {
            flexDirection: 'row',
            marginBottom: '0.2cm',
            width: '100%'
        },
        key: {
            fontWeight: 'bold',
            fontFamily: 'NotoSansDevanagariRegularFont',
            marginRight: '0.25cm',
            fontSize: '10px',
            marginBottom: '0.3cm'
        },
        value: {
            // flex: 1,
            fontSize: '10px',
            fontFamily: 'NotoSansDevanagariRegularFont',
            // marginBottom: '0.5cm'/
        },
        InvoiceTitle: {
            fontWeight: 'bold',
            marginRight: '0.25cm',
            fontSize: '25px',
            fontFamily: 'NotoSansDevanagariRegularFont',
            marginBottom: '10px',
            color: '#353B44'
        },
        marathiFont: {
            fontWeight: 'bold',
            marginRight: '0.25cm',
            fontSize: '10px',
            fontFamily: 'NotoSansDevanagariRegularFont'
        },
        htmlTable: {
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '5px',
            textAlign: 'right',
            width: '100%'
        },
        htmlHeaderRow: {
            alignSelf: 'stretch',
            borderTop: '1px dashed #000',
            borderBottom: '1px dashed #000',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 0px',
            textAlign: 'left'
        },
        htmlTableBody: {
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        htmlItemColumn: {
            position: 'relative',
            textAlign: 'left',
            display: 'inline-block',
            width: '150px',
            flexShrink: 0
        },
        htmlQtyColumn: {
            position: 'relative',
            textTransform: 'capitalize',
            fontWeight: 600,
            width: '65px',
            textAlign: 'right'
        },
        htmlAmountColumn: {
            position: 'relative',
            // textTransform: 'capitalize',
            // fontWeight: 600,
            textAlign: 'right',
            display: 'inline-block',
            width: '60px',
            flexShrink: 0
        },
        headerTitle: {
            fontSize: '10.5px',
            fontFamily: 'NotoSansDevanagariBoldFont'
        },
        thanksView: {
            position: 'relative',
            marginTop: '10px',
            marginBottom: '20px',
            width: '100%'
        },
        tableBodyTitle: {
            fontSize: '10.5px',
            // fontWeight: '400', 
            fontFamily: 'NotoSansDevanagariRegularFont'
        },
        table: {
            display: 'table',
            width: '100%',
            borderStyle: 'solid',
            borderColor: '#bfbfbf',
            marginTop: '10px',
            borderWidth: 1,
            borderRadius: '5px'
        },
        tableRow: {
            margin: 'auto',
            padding: '5px 10px',
            flexDirection: 'row',
        },
        tableProductCell: {
            margin: 'auto',
            marginTop: 5,
            marginBottom: 5,
            // textAlign: 'center',
            width: '50%',
            fontFamily: 'NotoSansDevanagariRegularFont'
        },
        tableQtyCell: {
            margin: 'auto',
            marginTop: 5,
            marginBottom: 5,
            textAlign: 'right',
            width: '10%',
            fontFamily: 'NotoSansDevanagariRegularFont'
        },
        tableCell: {
            margin: 'auto',
            marginTop: 5,
            marginBottom: 5,
            textAlign: 'right',
            width: '20%',
            fontFamily: 'NotoSansDevanagariRegularFont'
        },
        tableHeader: {
            backgroundColor: '#F2F4FD',
        },

    });
    // Register a Devanagari font
    Font.register({
        family: 'NotoSansDevanagariRegularFont',
        src: NotoSansDevanagariRegular
    });

    // Register a Devanagari font
    Font.register({
        family: 'NotoSansDevanagariBoldFont',
        src: NotoSansDevanagariBold
    });

    // Function to create a new list with summed quantities for the same productId
    const getSummedQuantities = (details) => {
        const productQuantities = {};

        details.forEach((detail) => {
            const { productId, quantity } = detail;
            if (productQuantities[productId] === undefined) {
                productQuantities[productId] = { ...detail };
            } else {
                productQuantities[productId].quantity += quantity;
            }
        });

        return Object.values(productQuantities);
    }

    const generateInvoice = (invoice) => {
        // Calculate the quantity wise total rate  using reduce
        const totalValue = invoice?.details?.reduce((accumulator, currentItem) => {
            return accumulator + (currentItem.rate * currentItem.quantity);
        }, 0);

        // // Calculate the total rate  using reduce
        // const totalRate = invoice?.details?.reduce((accumulator, currentItem) => {
        //     return accumulator + currentItem.rate;
        // }, 0);

        // Calculate the total rate using reduce
        const totalQuantity = invoice?.details?.reduce((accumulator, currentItem) => {
            return accumulator + currentItem.quantity
        }, 0);
        const PaymentMethod = invoice.modeOfPayment == 0 ? intl.formatMessage({ id: 'Cash' }) : intl.formatMessage({ id: 'UPI' })

        const summedDetails = getSummedQuantities(invoice?.details);

        return (
            <>
                {/* <div style={{ width: "100%", display: "flex", flexWrap: 'nowrap', flexDirection: "row" }}>
                    <div style={{ width: '50%' }}>
                        <Text style={styles.InvoiceTitle}>{intl.formatMessage({ id: 'invoice' })}</Text>
                        <Text style={styles.key}>
                    </div>
                </div> */}
                <View style={{ width: '100%', padding: '10px', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: '13px', textAlign: 'center', textTransform: 'uppercase', paddingHorizontal: '0px', lineHeight: '1.3px', fontFamily: 'NotoSansDevanagariBoldFont' }}>{invoice?.companyName}</Text>
                    <Text style={{ fontSize: '10px', fontWeight: '400', textAlign: 'center', marginTop: '8px', textTransform: 'uppercase', lineHeight: '1.4px' }}>{invoice?.storeLongName}</Text>
                    <Text style={{ fontSize: '10px', fontWeight: '400', textAlign: 'center', marginTop: '8px', textTransform: 'uppercase', lineHeight: '1.4px' }}>{invoice?.address}</Text>
                    <Text style={{ fontSize: '10px', fontWeight: '400', textAlign: 'center', marginTop: '5px', width: '50%' }}>{intl.formatMessage({ id: 'RegisterPhone' })} : {invoice?.storePhoneNumber}</Text>
                    <Text style={{ fontSize: '13px', textAlign: 'center', width: '70%', marginTop: '10px', fontFamily: 'NotoSansDevanagariBoldFont' }}>{invoice?.storeName}</Text>
                </View>
                <View style={{ display: 'flex', width: '100%' }}>
                    {/* <View style={{ width: '50%' }}> */}
                    <View style={styles.keyValueContainer}>
                        <Text style={styles.tableBodyTitle}>{intl.formatMessage({ id: 'Email' })} : </Text>
                        <Text style={styles.tableBodyTitle}>{invoice?.storeEmail}</Text>
                    </View>
                    {/* </View>
                    <View style={{ width: '50%' }}> */}
                    <View style={[styles.keyValueContainer]}>
                        <Text style={styles.tableBodyTitle}>{intl.formatMessage({ id: 'FoodLicenseNo' })} : </Text>
                        <Text style={styles.tableBodyTitle}>{invoice?.foodLicenseNumber}</Text>
                    </View>
                    {/* </View> */}
                </View>

                <View style={[styles.keyValueContainer, { borderTop: '1px dashed #000', paddingTop: '8px' }]}>
                    <Text style={[styles.tableBodyTitle, { width: '110px' }]}>{intl.formatMessage({ id: 'CustomerName' })} : </Text>
                    <Text style={[styles.tableBodyTitle, { width: '250px' }]}>{invoice?.customerName}</Text>
                </View>
                {/* <View style={styles.keyValueContainer}>
                    <Text style={styles.marathiFont}>{intl.formatMessage({ id: 'StoreName' })} : </Text>
                    <Text style={styles.value}>{invoice?.storeName}</Text>
                </View> */}
                <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <View style={{ width: '50%' }}>
                        <View style={styles.keyValueContainer}>
                            <Text style={styles.tableBodyTitle}>{intl.formatMessage({ id: 'InvoiceNo' })} : </Text>
                            <Text style={styles.tableBodyTitle}>#{invoice?.documentNumber}</Text>
                        </View>
                        <View style={[styles.keyValueContainer, { justifyContent: 'start' }]}>
                            <Text style={styles.tableBodyTitle}>{intl.formatMessage({ id: 'date' })} : </Text>
                            <Text style={styles.tableBodyTitle}>{moment(invoice.date).local().format("DD/MM/YYYY")}</Text>
                        </View>
                    </View>
                    <View style={{ width: '50%' }}>

                        <View style={[styles.keyValueContainer, { justifyContent: 'flex-end' }]}>
                            <Text style={styles.tableBodyTitle}>{intl.formatMessage({ id: 'PaymentMethod' })} : </Text>
                            <Text style={styles.tableBodyTitle}>{PaymentMethod}</Text>
                        </View>
                        <View style={[styles.keyValueContainer, { justifyContent: 'flex-end' }]}>
                            <Text style={styles.tableBodyTitle}>{intl.formatMessage({ id: 'MobileNumber' })} : </Text>
                            <Text style={styles.tableBodyTitle}>{invoice?.mobileNumber}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.htmlTable}>
                    <View style={styles.htmlHeaderRow}>
                        <View style={styles.htmlItemColumn}>
                            <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'Item' })}</Text>
                        </View>
                        <View style={styles.htmlQtyColumn}>
                            <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'Qty' })}</Text>
                        </View>
                        <View style={styles.htmlQtyColumn}>
                            <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'UNITPRICE' })}</Text>
                        </View>
                        <View style={styles.htmlAmountColumn}>
                            <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'Amt' })}</Text>
                        </View>
                    </View>
                    {summedDetails.map((val, index) => (
                        <View style={styles.htmlTableBody} key={index}>
                            <View style={styles.htmlItemColumn}>
                                <Text style={styles.tableBodyTitle}>{val.productName}</Text>
                            </View>
                            <View style={styles.htmlQtyColumn}>
                                <Text style={styles.tableBodyTitle}>{val.quantity}</Text>
                            </View>
                            <View style={styles.htmlQtyColumn}>
                                <Text style={styles.tableBodyTitle}>{Number(val.rate)?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.htmlAmountColumn}>
                                <Text style={styles.tableBodyTitle}>{(Number(val.rate)?.toFixed(2) * val.quantity).toFixed(2)}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.htmlHeaderRow}>
                        <View style={styles.htmlItemColumn}>
                            <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'Total' })}</Text>
                        </View>
                        <View style={styles.htmlQtyColumn}>
                            <Text style={styles.headerTitle}>{totalQuantity}</Text>
                        </View>
                        <View style={styles.htmlQtyColumn}>
                            {/* <Text style={styles.headerTitle}>{Number(totalRate).toFixed(2)}</Text> */}
                            <Text style={styles.headerTitle}></Text>
                        </View>
                        <View style={styles.htmlAmountColumn}>
                            <Text style={styles.headerTitle}>{Number(totalValue).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.thanksView}>
                    <Text style={[styles.headerTitle, { textAlign: 'center' }]}>{intl.formatMessage({ id: 'ThanksLabel' })}</Text>
                </View>
            </>
        )
    };

    const InvoiceDocument = generateInvoice(invoice);

    const MyDocument = () => (

        <Document title=''>
            <Page key={'dr-page'} size={{ width: 320 }} style={styles.page}>
                <View key={'dr-view'} style={styles.section}>
                    {InvoiceDocument}
                </View>
            </Page>
        </Document>
    );


    return (
        <Grid container>
            <Grid item xs={12} pb={2}>
                <Stack>
                    <DialogTitle className='model-header'>{intl.formatMessage({ id: 'InvoicePrint' })}</DialogTitle>
                    <Divider />
                    <Stack sx={{ marginLeft: "25px", marginBottom: "-16px !important", marginTop: "15px" }}>
                        {intl.formatMessage({ id: 'PrintInvoiceLabel' })}
                    </Stack>
                    <DialogContent>
                        <PDFDownloadLink document={<MyDocument />} fileName="qrcodes.pdf">
                            {({ loading }) => (loading ? 'Loading document...' : '')}
                        </PDFDownloadLink>
                        <PDFViewer width="100%" height={350}>
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
    )
}

export default PrintInvoice